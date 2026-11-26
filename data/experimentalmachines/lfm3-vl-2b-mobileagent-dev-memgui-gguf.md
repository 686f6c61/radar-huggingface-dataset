# experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-MemGUI-GGUF

## Resumen

LFM3-VL-2B-MobileAgent-Dev-MemGUI-GGUF es la distribucion en formato GGUF del modelo experimental LFM3-VL-2B-MobileAgent-Dev-MemGUI, un ajuste fino multimodal orientado a la automatizacion de interfaces graficas en telefonos Android. Lo publica el usuario experimentalmachines y parte de los pesos de LiquidAI/LFM3-VL-2B, un modelo vision-lenguaje de aproximadamente 1.730 millones de parametros. El modelo recibe una captura de pantalla y un objetivo en lenguaje natural, y produce la siguiente accion a ejecutar sobre la interfaz.

El modelo es una variante de desarrollo ("Dev") que incorpora un componente de memoria GUI ("MemGUI") respecto a la version base del mismo autor. Segun la propia model card, se conserva unicamente para reproducir resultados y no se recomienda su uso: fallo su validacion offline y no se llego a ejecutar en AndroidWorld. Las cifras offline que reporta el autor provienen de los pesos en bf16, no de esta cuantizacion.

Su relevancia es acotada pero clara: demuestra el flujo completo de convertir un modelo vision-lenguaje de 2B a GGUF para llama.cpp con soporte de proyector visual, de forma que pueda ejecutarse en un telefono. La distribucion incluye el modelo de lenguaje cuantizado en Q4_K_M y el proyector de vision en Q8_0 sin modificar respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (transformer multimodal con proyector visual); detalles internos no disponibles |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens en la configuracion de servicio recomendada (llama-server `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M para el modelo de lenguaje; Q8_0 para el proyector visual (mmproj) |
| Idiomas soportados | Ingles |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | GGUF (dos ficheros: modelo de lenguaje y proyector visual) |

## Arquitectura y entrenamiento

El modelo base es un vision-lenguaje de la familia LFM3-VL de LiquidAI, con unos 1.730 millones de parametros. La arquitectura interna detallada (numero de capas, atencion, diseno del proyector) no se especifica en la informacion disponible. El ajuste fino realizado por experimentalmachines se aplico sobre el modelo de lenguaje: segun la model card, el fine-tune no modifico la torre de vision, y el proyector visual (mmproj) es identico al de LiquidAI/LFM3-VL-2B-GGUF.

El entrenamiento se realizo exclusivamente sobre demostraciones grabadas: el modelo nunca interactuo con un telefono real durante el entrenamiento. La variante "MemGUI" incorpora un componente de memoria de interfaz grafica respecto a la version base del mismo autor. No se dispone de datos sobre volumen de tokens, composicion del dataset ni uso de RLHF o DPO. La conversion a GGUF se hizo con llama.cpp (commit `cd959bae9`) mediante `convert_hf_to_gguf.py` a F16 y posterior `llama-quantize` a Q4_K_M.

## Capacidades

- Comprension de capturas de pantalla de Android y generacion de la siguiente accion sobre la interfaz (image-text-to-text).
- Automatizacion de tareas guiadas por objetivo en lenguaje natural (en ingles).
- Razonamiento de un solo paso por captura: el formato asume una imagen por paso.
- Formato de razonamiento compatible con `--reasoning-format deepseek` en llama-server.
- Soporte conversacional multi-turno segun los tags del repositorio.
- Capacidades de tool calling, function calling y agentes multi-paso: no disponibles de forma explicita en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles.
- Vision: si, mediante el proyector visual Q8_0.

## Casos de uso

- Reproduccion de resultados de investigacion: el modelo existe para replicar las cifras offline del autor sobre los pesos bf16; util como referencia en estudios de agentes GUI moviles.
- Prototipado de agentes GUI en Android: permite probar el bucle captura de pantalla, decision de accion y ejecucion en un telefono con llama.cpp antes de pasar a un modelo recomendado.
- Evaluacion de cuantizacion en modelos multimodales pequenos: comparar el comportamiento de Q4_K_M frente a bf16 en tareas de comprension de pantalla.
- Desarrollo de harnesses de benchmark: sirve como sujeto de prueba en pipelines de evaluacion tipo AndroidWorld, aunque este modelo concreto no se llego a ejecutar en dicha plataforma.
- Experimentacion con memoria de interfaz (MemGUI): estudiar como afecta un componente de memoria al seguimiento de tareas en pantallas moviles.
- Despliegue local en dispositivo: con 1,3 GB de repositorio y cuantizacion Q4_K_M, es viable ejecutarlo en un telefono moderno con llama.cpp para pruebas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta cuantizacion. La model card indica que el modelo fallo su validacion offline y no se ejecuto en AndroidWorld, y que las cifras offline del autor corresponden a los pesos bf16, no a este GGUF.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M del modelo de lenguaje mas el proyector Q8_0 suman un total del orden de 1,3 GB de repositorio; la inferencia completa requiere espacio adicional para el contexto de 8.192 tokens.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM deberia poder cargar el modelo con `-ngl 99`; no hay datos de rendimiento en A100 o H100.
- GPU consumer: si, cabe en tarjetas de gama media y en telefonos Android mediante llama.cpp.
- Opciones de despliegue: llama.cpp (llama-server con `--mmproj`), segun la configuracion documentada; otras opciones no disponibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-Dev-MemGUI-GGUF (este) | 1.73B | 8.192 (servicio) | GGUF Q4_K_M + mmproj Q8_0 | LFM Open License v1.0 | Variante de desarrollo, no recomendada por el autor |
| LFM3-VL-2B-MobileAgent | No disponible | No disponible | No disponible | LFM Open License v1.0 | Version recomendada por el autor en lugar de esta |
| LiquidAI/LFM3-VL-2B | Aprox. 1.73B | No disponible | safetensors / GGUF | LFM Open License v1.0 | Modelo base sin ajuste para agentes GUI |

## Limitaciones y advertencias

- Modelo de investigacion en estado de desarrollo: el propio autor indica que no se recomienda su uso y que debe emplearse LFM3-VL-2B-MobileAgent en su lugar.
- Fallo la validacion offline y no se ejecuto en AndroidWorld; las cifras offline publicadas corresponden a los pesos bf16, no a esta cuantizacion.
- No debe dejarse actuar de forma desatendida en un telefono con cuentas, mensajes o pagos reales.
- Solo acepta objetivos en ingles y una captura de pantalla por paso.
- Entrenado unicamente con demostraciones grabadas; nunca interactuo con un telefono real durante el entrenamiento.
- Riesgo de alucinacion en la identificacion de elementos de interfaz no disponible como dato medido, pero inherente a los modelos de este tamano.
- Licencia LFM Open License v1.0: conviene revisar sus terminos antes de cualquier uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-MemGUI-GGUF
- Modelo base (bf16): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-MemGUI
- Version recomendada: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- GGUF de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Repositorio del proyecto: https://github.com/ExperimentalMachines/lfm3-mobile-agent
- Guia de nombres: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Documentacion de modelos: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/results.md
