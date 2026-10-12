# mlx-community/SenseNova-U1.5-8B-MoT-8step-v2-4bit

## Resumen

SenseNova-U1.5-8B-MoT-8step-v2-4bit es un artefacto para Apple Silicon (MLX) del modelo unificado multimodal SenseNova-U1.5-8B-MoT de SenseTime / SenseNova. Se trata de la conversion del checkpoint original (licencia Apache-2.0) al formato de runtime de MLX, con el adaptador de destilacion a 8 pasos en su version V2 fusionado en fp32 sobre las 294 proyecciones del flujo de generacion, seguido de una conversion a bf16 y una cuantizacion de 4 bits con grupo 64. El resultado es un unico repositorio que cubre generacion de imagen a partir de texto, edicion por instrucciones y respuesta visual a preguntas (VQA) bajo una arquitectura comun.

La arquitectura subyacente es NEO-unify Mixture-of-Transformers (MoT) con rectified flow en espacio de pixeles y sin VAE, lo que elimina el cuello de botella del autoencoder y permite operar directamente sobre pixeles. El objetivo del artefacto es ofrecer el nivel mas pequeno y rapido de la familia: segun el autor, alcanza un pico de 14,7 GB de memoria y genera una imagen de 1024x1024 en 3,2 segundos en un chip M5 Max, de modo que cabe en equipos Mac de gama de 16 GB. Es relevante ahora porque lleva inferencia de difusion multimodal a hardware de consumo con un coste de memoria muy contenido, a cambio de una perdida medible de fidelidad respecto al checkpoint en bf16.

La version V2 del adaptador se presenta como la recomendada frente a V1: mejora el equilibrio de color, produce un contraste mas natural y reduce el sobrenfocado. Los datos de cuantizacion del propio autor indican que la variante int4 mantiene una similitud coseno de 0,976 y 24,2 dB frente al render bf16 con el merge aplicado en carga, mas ajustada que el nivel V1 (aproximadamente 0,92).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NEO-unify Mixture-of-Transformers (MoT); rectified flow en espacio de pixeles, sin VAE |
| Parametros totales | 17.532.854.464 (segun safetensors del repositorio; el nombre del modelo base indica 8B) |
| Parametros activos | no disponible (arquitectura Mixture-of-Transformers, no un MoE disperso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits con grupo 64 (convencion MLX, bloque `quantization` en config.json); el adaptador se fusiona en fp32 y despues se castea a bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (layout MLX: convoluciones NHWC; lineales cuantizadas como `weight`/`scales`/`biases`) |

## Arquitectura y entrenamiento

El modelo upstream es el buque insignia multimodal de SenseNova: un transformer unificado (NEO-unify Mixture-of-Transformers) que combina generacion texto-a-imagen, edicion de imagen por instrucciones y VQA en una sola pila. La generacion emplea rectified flow operando directamente en espacio de pixeles, sin VAE intermedio. El artefacto de este repositorio no reentrena el modelo: parte del checkpoint `sensenova/SenseNova-U1.5-8B-MoT` (commit `07d76f6`), aplica el adaptador de destilacion a 8 pasos `SenseNova-U1.5-8B-MoT-LoRA-8step-V2` (liberado el 24-09-2026, sha256 `f4190cab...`) y lo fusiona en fp32 como W += (alfa/r)·BA sobre 294 proyecciones del flujo de generacion. Despues castea a bf16 y cuantiza a 4 bits con grupo 64. Frente al artefacto V1, exactamente 882 tensores difieren (294 x weight/scales/biases) y ninguno mas.

El adaptador destilado reduce la generacion a 8 pasos con cfg 1,0, lo que evita la decodificacion larga tipica de los modelos de difusion y es la base de su baja latencia. El runtime asociado, `sensenova-u1-swift` (MLX-Swift, variante `8step-v2-4bit`), almacena los pesos en su propio layout de claves para que carguen sin conversion transitoria: la memoria pico de carga es aproximadamente igual a la memoria residente. El autor declara una paridad por componente inferior a 1e-4 y una similitud coseno end-to-end por paso de 0,999 o superior frente a la implementacion de referencia en PyTorch. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de imagen a partir de texto con resoluciones de 1024x1024, en 8 pasos de muestreo y cfg 1,0.
- Edicion de imagen por instrucciones mediante la opcion `--edit-image` del runtime, disponible en los niveles base del modelo.
- VQA (respuesta visual a preguntas) mediante `--vqa`, disponible en los niveles base.
- Modo de razonamiento con etiquetas `<think>` (`--think`) en los niveles base.
- Naturaleza any-to-any: el pipeline declarado en HuggingFace es `any-to-any`, con flujos de comprension y generacion conviviendo en la misma arquitectura.
- Destilacion a 8 pasos: reduce el coste de inferencia frente a los adaptadores de mas pasos y esta pensada para el nivel mas rapido de la familia.
- Capacidades de idioma: no disponible (la model card no enumera idiomas soportados).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de imagenes en local sobre Mac: el artefacto cabe en equipos de 16 GB de clase Mac y produce 1024x1024 en 8 pasos, por lo que se puede usar para crear ilustraciones, bocetos o material grafico sin depender de servicios en la nube ni de GPUs dedicadas.
- Prototipado rapido de producto en desarrollo: al generar en 3,2 segundos por imagen en un M5 Max, permite iterar sobre variaciones de un concepto visual dentro de un bucle de diseno interactivo.
- Pipelines de aumento de datos visuales: se pueden sintetizar imagenes etiquetadas por prompt para completar conjuntos de datos pequenos, siempre que se asuma que la cuantizacion de 4 bits introduce una deriva medible respecto a bf16.
- Evaluacion comparativa de cuantizacion en difusion: el autor publica metricas reproducibles (saturacion media, contraste RMS, percentil 99 de gradiente, recorte de sombras y luces) que permiten estudiar como afecta int4 a la trayectoria de denoising con semilla fija.
- Despliegue en aplicaciones macOS o iOS: el runtime MLX-Swift y el tag `mlx-swift` apuntan a integracion nativa en el ecosistema Apple, con layout de pesos ya adaptado para evitar conversiones en carga.
- Experimentacion academica con sistemas unificados: sirve para estudiar arquitecturas Mixture-of-Transformers sin VAE y comparar la calidad de los flujos de comprension y generacion en un unico modelo.
- Reproduccion de semillas en produccion: como el artefacto V1 se mantiene publicado sin cambios, los proyectos que dependen de semillas concretas pueden congelar V1 mientras otros adoptan V2 para mejorar color y contraste.
- Generacion de imagenes fieles a bf16 en entornos con mas memoria: cuando la fidelidad importa, el propio autor recomienda el nivel de 8 bits en lugar del de 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos cuantitativos aportados por el autor son comparativas internas entre variantes y una medicion de latencia:

| Metrica | Valor |
|---|---|
| Memoria pico (M5 Max) | 14,7 GB |
| Latencia 1024x1024, 8 pasos, cfg 1,0 | 3,2 s |
| Similitud frente a bf16 con merge en carga (int4) | coseno 0,976; 24,2 dB |
| Similitud frente a bf16 (nivel V1) | coseno aproximado 0,92 |
| Saturacion media V2 vs V1 (5 prompts, semilla fija) | -0,071 |
| Contraste RMS V2 vs V1 | -0,049 |
| Gradiente en percentil 99 V2 vs V1 | -30 % |
| Recorte de sombras V2 vs V1 | 8,5 puntos porcentuales menos |
| Recorte de luces V2 vs V1 | 14,8 puntos porcentuales menos |
| Similitud de composicion V1 vs V2 | coseno entre 0,80 y 0,96 |
| Paridad por componente vs implementacion de referencia PyTorch | < 1e-4 |
| Similitud coseno end-to-end por paso vs referencia PyTorch | 0,999 o superior |

No hay resultados publicados de MMLU, HumanEval, GSM8K ni de benchmarks estandar de generacion de imagen (FID, CLIPScore) en la informacion disponible.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon. El artefacto usa la libreria MLX y el runtime MLX-Swift; no hay soporte CUDA ni ROCm.
- VRAM/memoria unificada estimada: 14,7 GB de pico segun el autor, con memoria de carga aproximadamente igual a la residente gracias al layout nativo del runtime.
- Equipos compatibles: cabe en Macs de la clase de 16 GB. El dato de rendimiento publicado corresponde a un M5 Max.
- GPU recomendadas: no aplica; el modelo no esta pensado para A100, H100 ni RTX 4090. La via es Apple Silicon (series M).
- Opciones de despliegue: runtime propio `sensenova-u1-swift` (MLX-Swift), con CLI `sensenova-cli` y las opciones `--edit-image`, `--vqa` y `--think` en los niveles base. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 3,2 s por imagen de 1024x1024 con 8 pasos y cfg 1,0 en M5 Max. El throughput en otros chips de la familia M no esta disponible.
- Carga de pesos: descarga via `hf download` con un repositorio de 11,8 GB.

## Comparativa con modelos similares

Solo se dispone de informacion sobre variantes dentro de la propia familia. No hay datos en la informacion proporcionada sobre modelos comparables de otros autores.

| Modelo | Parametros | Cuantizacion | Latencia / memoria | Licencia | Notas |
|---|---|---|---|---|---|
| SenseNova-U1.5-8B-MoT-8step-v2-4bit (este) | 17.532.854.464 en safetensors | 4 bits, grupo 64 | 3,2 s a 1024², pico 14,7 GB (M5 Max) | Apache-2.0 | Adaptador 8step V2 fusionado; fidelidad int4 cos 0,976 / 24,2 dB |
| mlx-community/SenseNova-U1.5-8B-MoT-8step-4bit | no disponible | 4 bits | no disponible | Apache-2.0 | Version V1 del adaptador; se mantiene para reproducir semillas antiguas; fidelidad aproximada cos 0,92 |
| sensenova/SenseNova-U1.5-8B-MoT (upstream) | 17.532.854.464 en este derivado; el nombre indica 8B | bf16 (base) | no disponible | Apache-2.0 | Checkpoint original sin destilar a 8 pasos; referencia de maxima fidelidad |
| Nivel de 8 bits de la familia | no disponible | 8 bits | no disponible | Apache-2.0 | Recomendado por el autor cuando se necesita fidelidad a bf16; identificador de repositorio no disponible |

## Limitaciones y advertencias

- La cuantizacion a 4 bits sobre una ruta de difusion perturba de forma medible la trayectoria de denoising: con semilla fija produce una imagen distinta, aunque el autor la considera igualmente valida. Para salidas fieles a bf16 hay que usar el nivel de 8 bits.
- Es un artefacto destilado a 8 pasos: la velocidad se obtiene a cambio de calidad frente a configuraciones con mas pasos de muestreo.
- El adaptador V2 cambia el resultado respecto a V1 (saturacion, contraste y gradientes), de modo que las semillas de proyectos existentes no se reproducen igual; por eso V1 sigue publicado.
- Dependencia exclusiva de Apple Silicon y del runtime MLX-Swift: no hay ruta documentada para CUDA, vLLM, llama.cpp, Ollama ni TGI, lo que limita su uso en servidores tradicionales.
- El repositorio incluye la etiqueta `custom_code`, lo que implica que la carga puede requerir `trust_remote_code` y revision del codigo en entornos no confiables.
- Es una conversion de la comunidad (mlx-community) y no una publicacion oficial de SenseTime; la responsabilidad sobre la fusion del LoRA y la cuantizacion recae en el autor del artefacto.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de comportamiento en produccion.
- No se especifican idiomas soportados ni longitud de contexto, lo que impide planificar aplicaciones multilingues o de contexto largo con este artefacto.
- Riesgo de alucinacion en las tareas de comprension (VQA) y de desviacion respecto a la instruccion en edicion: no se publican tasas de error ni evaluaciones de fidelidad semantica.
- La licencia Apache-2.0 permite uso comercial, pero obliga a conservar los avisos de atribucion y a documentar las modificaciones realizadas sobre el checkpoint original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mlx-community/SenseNova-U1.5-8B-MoT-8step-v2-4bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT
- Commit del modelo base: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT/commit/07d76f61474b9c6e6999e22c559314d3439b8c81
- Repositorio de adaptadores LoRA: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT-LoRAs
- Espejo del repositorio de LoRAs: https://huggingface.co/xocialize/SenseNova-U1.5-8B-MoT-LoRAs
- Artefacto V1 de 8 pasos en 4 bits: https://huggingface.co/mlx-community/SenseNova-U1.5-8B-MoT-8step-4bit
- Runtime MLX-Swift: https://github.com/xocialize/sensenova-u1-swift
- Implementacion de referencia: https://github.com/OpenSenseNova/SenseNova-U1
- Paper: https://arxiv.org/abs/2605.12500

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los enlaces anteriores proceden de la informacion del repositorio de HuggingFace.
