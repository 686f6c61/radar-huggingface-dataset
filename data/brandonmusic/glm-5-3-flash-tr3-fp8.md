# brandonmusic/glm-5.3-flash-tr3-fp8

## Resumen

glm-5.3-flash-tr3-fp8 es un checkpoint cuantizado publicado por el usuario brandonmusic, derivado del modelo base zai-org/GLM-5.3-Flash-BF16. Se trata del paquete completo del codec-v2 de TrellisMX en su variante B, construido sobre cuatro GPU NVIDIA B200 alquiladas. No es un checkpoint genérico de Transformers: su carga exige el runtime TrellisMX y el checkpoint no se almacena como una copia completa de 8 bits.

El paquete contiene las 42 capas enrutadas principales (capas 3 a 44) más la capa MTP45, distribuidas en 172 sidecars TP4 con formato acoplado H512/H128, junto con un directorio `carrier/` que conserva sin cambios el backbone, el shared-expert, los módulos de atención, los activos de visión, el MTP no experto, las escalas, la configuración y el tokenizador. La carga útil de pesos declarada es de 4,25 bits por peso, con 165.721.576.928 bytes de sidecars enrutados y 19.388.363.261 bytes de carrier, lo que da un repositorio de 193 GB.

Su relevancia es doble: por un lado explora cuantización de muy baja precisión (4,25 bpw) sobre una arquitectura MoE con predicción multi-token, y por otro publica una medición de divergencia KL (KLD) de 0,027881131803, un 7,37 % inferior a la referencia TR3 registrada de 0,030099944949. El modelo no tiene descargas ni likes, y la licencia y los idiomas no están declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE): capas enrutadas, shared-expert y capa de prediccion multi-token MTP45; el carrier incluye activos de vision. Detalle del mecanismo de atencion: no disponible |
| Parametros totales | no disponible (el checkpoint relacionado brandonmusic/GLM-5.3-Flash-tr3-4bpw figura como 87,8 B en LLM Explorer, dato no confirmado para este paquete) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la configuracion de servicio emplea 8.192 tokens en lote, dato que no equivale a la ventana de contexto del modelo) |
| Tipos de cuantizacion | TrellisMX codec-v2 variante B a 4,25 bits por peso; indices Trellis decodificados a operandos E4M3 con escalas UE8M0/K32; tensores enrutados NVFP4 reemplazados en las capas principales 3 a 44 y expertos MTP45 MXFP8 reemplazados; KV en FP8 en el perfil de servicio incluido |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (sidecars TrellisMX en formato acoplado H512/H128); requiere runtime TrellisMX, no es un checkpoint compatible con Transformers generico |

## Arquitectura y entrenamiento

El modelo base es una arquitectura MoE con capas enrutadas, un shared-expert siempre activo y una capa de prediccion multi-token (MTP45) que permite generar varios tokens por paso de decodificacion. Este repositorio no reentrena el modelo: aplica una cuantizacion post-entrenamiento sobre el checkpoint BF16 de referencia (`zai-org/GLM-5.3-Flash-BF16@a6c167b62691b2bac901344b65cb651a70f53e43`). El indice de tensores del carrier conserva todos los tensores salvo los NVFP4 enrutados de las capas 3 a 44 y los expertos MXFP8 de MTP45, que quedan sustituidos por los sidecars TrellisMX.

El codificador emplea hessianos enrutados y de todos los tokens con beta 0,5, amortiguamiento 0,3 y escalas UE8M0 redondeadas a potencias de dos. La asignacion de recursos es uniforme: 4 sidecars por cada una de las 43 capas (42 principales mas MTP45), lo que da los 172 sidecars TP4 declarados. En servicio, el formato nativo P8 de Tensor Core decodifica los indices Trellis comprimidos a operandos E4M3 con escalas UE8M0/K32; los demas modulos mantienen la precision del carrier nativo.

La medicion de calidad se realizo con 128 ventanas de ajuste condicional, logits de profesor procedentes de `brandonmusic/GLM-5.3-Flash-BF16-Teacher-Logits@95f4fdd94bf29989db2e0d1054e4931f55edb6aa`, ejecucion en Transformers 5.17, forwards causales completos de 2048 tokens, KV sin cuantizar y un backbone no enrutado en BF16. La KLD profesor-alumno cubre el vocabulario completo de 154.880 tokens y puntua las filas 1 a 2046.

## Capacidades

- Generacion de texto autoregresiva sobre una arquitectura MoE con experto compartido, heredada del modelo base GLM-5.3-Flash.
- Prediccion multi-token mediante la capa MTP45, con perfiles de servicio configurados para MTP3 (tres tokens de prediccion).
- Procesamiento multimodal: el carrier incluye los activos de vision, si bien la model card no documenta el soporte de imagen de forma explicita.
- Razonamiento de alto esfuerzo: las mediciones declaradas se ejecutan con "high reasoning effort", lo que indica la existencia de modos de razonamiento configurables.
- Capacidad de ejecucion en paralelismo tensor TP4 y DCP4 con EPI-PAR, orientada a despliegues multi-GPU.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas; el vocabulario de 154.880 tokens sugiere cobertura amplia, pero no hay lista de idiomas declarada.

## Casos de uso

- Investigacion en cuantizacion extrema: el paquete sirve como material reproducible para estudiar el impacto de 4,25 bits por peso sobre una MoE de gran tamano, comparando la KLD obtenida contra la referencia TR3 registrada.
- Despliegue autoalojado en cuatro GPU RTX PRO 6000 Blackwell: el repositorio incluye `docker-compose.yml` y `serve.sh` con la imagen `verdictai/trellismx` fijada por digest, lo que permite levantar el servicio sin descargar pesos base adicionales.
- Evaluacion de la decodificacion MTP en produccion: con MTP3 activo y 48 secuencias simultaneas a 8.192 tokens en lote, es un banco de pruebas para medir ganancias de latencia en decodificacion multi-token.
- Inferencia multimodal en entornos con memoria limitada: al conservar los activos de vision en el carrier, permite servir entradas de imagen sin cargar el checkpoint BF16 completo.
- Reproduccion de mediciones de divergencia KL: util para equipos que comparan rutas de ejecucion (BF16 no enrutado con KV sin cuantizar frente a servicio nativo con KV FP8) y necesitan aislar el efecto de los pesos enrutados.
- Comparacion de formatos de cuantizacion: la familia incluye variantes NVFP4, MXFP8 y EXL3/TR3, por lo que este checkpoint permite contrastar codecs sobre el mismo modelo base en una misma maquina.
- Canal de redistribucion de pesos cuantizados: el paquete es autocontenido (carrier mas sidecars), de modo que un tercero puede desplegarlo sin depender del repositorio BF16 original.

## Benchmarks y rendimiento

| Metrica | Codec-v2 B (este checkpoint) | TR3 nativo FP8-KV (referencia registrada) |
|---|---:|---:|
| KLD media de referencia | 0,027881131803 | 0,030099944949 |

Condiciones declaradas: 128 ventanas de ajuste condicional, logits de profesor, backbone no enrutado en BF16, Transformers 5.17, forwards causales completos de 2048 tokens y KV sin cuantizar. La cifra TR3 corresponde a un historico de servicio nativo con KV FP8 y decodificacion real. La diferencia del 7,37 % procede de una comparacion entre numeros registrados bajo condiciones de ejecucion distintas; la model card indica explicitamente que la superioridad en servicio nativo no ha sido establecida. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Construido sobre cuatro GPU NVIDIA B200 alquiladas; el perfil de servicio incluido esta pensado para cuatro RTX PRO 6000 Blackwell.
- Tamano del paquete: 165.721.576.928 bytes de sidecars enrutados (aproximadamente 154,3 GiB) mas 19.388.363.261 bytes de carrier (aproximadamente 18,1 GiB), con un total cercano a 172,4 GiB en disco.
- Estimacion derivada: un despliegue TP4 reparte esos pesos en unos 43 GiB por GPU solo en pesos, a lo que hay que sumar cache KV en FP8, activaciones y buffers.
- Configuracion de servicio declarada: TP4/DCP4, KV en FP8, MTP3, RP2, EPI-PAR, 48 secuencias y 8.192 tokens en lote.
- Opciones de despliegue: exclusivamente el runtime TrellisMX empaquetado (`docker compose up -d` con la imagen fijada por digest y los parches de MTP45 verificados por hash). No es compatible con vLLM estandar, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no medidos. La model card indica que la velocidad de servicio nativo no se ha medido y que los resultados de la suite local LAVD/Hotel/Estonia seguian en curso.

## Comparativa con modelos similares

| Modelo | Relacion | Formato y precision | Tamano | Licencia | Estado |
|---|---|---|---|---|---|
| brandonmusic/glm-5.3-flash-tr3-fp8 (este) | Cuantizacion codec-v2 variante B | TrellisMX, 4,25 bpw, FP8 KV en servicio | 193 GB de repositorio | no disponible | 0 descargas, 0 likes |
| brandonmusic/GLM-5.3-Flash-tr3-4bpw | Referencia TR3 previa | TR3, aproximadamente 4 bpw; 37,8 GB de VRAM segun LLM Explorer | 87,8 B segun LLM Explorer | no disponible | Referencia historica de KLD 0,030099944949 |
| brandonmusic/GLM-5.3-Flash-TrellisMX-MXFP8 (r27) | Variante MXFP8 de la misma familia | MXFP8 | no disponible | no disponible | Identidad referenciada como `ea7e0ea3...` |
| local-inference-lab/GLM-5.3-Flash-NVFP4 | Carrier nativo de referencia | NVFP4 | no disponible | no disponible | Identidad referenciada como `520de24e...` |
| brandonmusic/glm-5.3-flash-exl3-4bpw | Cuantizacion uniforme K4 EXL3/TR3 | EXL3/TR3 con KV NVFP4 MLA calibrado; requiere vLLM/B12X personalizado, incompatible con vLLM upstream | no disponible | no disponible | Perfiles TP2/EP2/DCP2 sobre dos GPU SM120 |
| zai-org/GLM-5.3-Flash-BF16 | Modelo base sin cuantizar | BF16 | no disponible | no disponible | Identidad referenciada como `a6c167b6...` |

## Limitaciones y advertencias

- Licencia no declarada: no hay base legal explicita para uso comercial. Es un riesgo relevante antes de cualquier despliegue en produccion.
- No es un checkpoint de Transformers: su carga requiere el runtime TrellisMX y no funciona con vLLM estandar, TGI, llama.cpp ni Ollama.
- La comparacion de KLD no es de runtime emparejado: la medicion usa backbone BF16 no enrutado, KV sin cuantizar y forwards completos de 2048 tokens, mientras que la referencia TR3 usaba servicio nativo con KV FP8. La propia model card advierte que no se ha establecido equivalencia en decodificacion real sobre SM120.
- El runner de referencia B200 emplea matmuls de expertos en FP32 y no ejecuta los kernels nativos FP8 de Tensor Core de la imagen, por lo que la KLD publicada no representa el comportamiento del paquete completo en servicio nativo.
- Velocidad de servicio nativo no medida: no hay datos de latencia ni throughput.
- Idiomas soportados no declarados; no se puede asumir cobertura multilingue concreta.
- Sin datos publicados de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar: la unica metrica disponible es la KLD frente al profesor.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (27 de septiembre de 2026), sin validacion independiente de la comunidad.
- Dependencia de una imagen de contenedor externa fijada por digest (`verdictai/trellismx`), lo que condiciona la reproducibilidad a largo plazo.
- Los resultados de la suite local de servicio (LAVD/Hotel/Estonia) estaban en curso en el momento de la publicacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brandonmusic/glm-5.3-flash-tr3-fp8
- Arbol de archivos: https://huggingface.co/brandonmusic/glm-5.3-flash-tr3-fp8/tree/main
- Modelo base BF16: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16 (revision `a6c167b62691b2bac901344b65cb651a70f53e43`)
- Logits de profesor: https://huggingface.co/brandonmusic/GLM-5.3-Flash-BF16-Teacher-Logits (revision `95f4fdd94bf29989db2e0d1054e4931f55edb6aa`)
- Variante MXFP8 (r27): https://huggingface.co/brandonmusic/GLM-5.3-Flash-TrellisMX-MXFP8 (revision `ea7e0ea310242dc0ce9a5faa9069eab6ebdbae9e`)
- Carrier nativo NVFP4: https://huggingface.co/local-inference-lab/GLM-5.3-Flash-NVFP4 (revision `520de24eabf507659eaef7c70f14fd584527facc`)
- Referencia TR3 previa: https://huggingface.co/brandonmusic/GLM-5.3-Flash-tr3-4bpw (revision `4bccf1bcf9dcd3357933a8ad91193de675331012`)
- Repositorio de la variante EXL3: https://github.com/brandonmmusic-max/glm-5.3-flash-exl3-4bpw
- Ficha en LLM Explorer: https://llm-explorer.com/model/brandonmusic%2FGLM-5.3-Flash-tr3-4bpw,14zD8pPHHSTx1192k07BmN
- Analisis de la familia TR3 4bpw: https://yololab.net/archives/brandonmusic-glm53-flash-tr3-4bpw-current-revision-2026
- Hash SHA256 del bundle original: `eeee96b2d09df5d...` (truncado en la informacion disponible)
