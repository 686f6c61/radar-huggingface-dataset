# LoRAFleet/openvla-oft-libero-reconstructed-r64

## Resumen

LoRAFleet/openvla-oft-libero-reconstructed-r64 es un conjunto de cuatro adaptadores LoRA de rango 64 reconstruidos por LoRAFleet a partir de los checkpoints fusionados publicados del proyecto OpenVLA-OFT (desarrollado por moojink). Los adaptadores cubren las cuatro suites del benchmark LIBERO: `spatial`, `object`, `goal` y `10` (LIBERO-10). No son los adaptadores de entrenamiento originales del publicador, sino reconstrucciones aproximadas obtenidas mediante SVD aleatorizado de la diferencia entre los pesos publicados y los pesos base.

Los cuatro adaptadores apuntan a los pesos oficiales de openvla/openvla-7b en la revisión `47a0ec7fc4ec123775a391911046cf33cf9ed83f`, verificada por SHA-256. Cada adaptador contiene 221.656.576 parámetros A/B (443.446.440 bytes en BF16) distribuidos sobre 439 módulos objetivo; los 543 tensores restantes del backbone coinciden exactamente con el modelo base, que no se duplica en este repositorio.

La relevancia práctica del release es que permite servir cuatro políticas de robótica LIBERO compartiendo una única copia de los pesos base de 7B, en lugar de mantener un checkpoint fusionado completo por tarea. La reconstrucción no es sin pérdidas y su validación se limita a una prueba de humo sobre la tarea ID 0 con ocho estados iniciales por suite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA de rango 64 sobre el modelo vision-lenguaje-accion OpenVLA-7B |
| Parametros totales | 7B (modelo base) + 221.656.576 parametros A/B por adaptador |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | factores almacenados en BF16; no se documentan otros esquemas de cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors en formato PEFT/LoRA; factores BF16 |

## Arquitectura y entrenamiento

No hay entrenamiento en este release. La contribucion es puramente de reconstruccion: para cada uno de los 439 modulos objetivo se factoriza `W_published - W_base` con SVD aleatorizado mediante una implementacion propia de FlashTSQR en GPU, con anchura de sketch 192, dos iteraciones de potencia, semilla 0 y rango de salida 64. El nucleo proyectado pequeno se factoriza con SVD convencional. Los factores resultantes son BF16 con `B = U*S`, `A = Vh` y escala 1 (`r = lora_alpha = 64`). Los 543 tensores de backbone restantes son identicos al modelo base en las cuatro suites.

El modelo subyacente, OpenVLA-7B, es un modelo vision-lenguaje-accion (VLA) que consume imagenes y propiocepcion y emite acciones continuas. Este release no reproduce el pipeline de entrenamiento de OpenVLA-OFT ni aplica RLHF/DPO; simplemente aproxima los pesos fusionados publicados en un formato de adaptador de bajo rango. La reconstruccion se declara explicitamente como no sin perdidas y no como una compresion adicional del presupuesto de rango.

## Capacidades

- Generacion de acciones motoras continuas para manipulacion robotica en las cuatro suites de LIBERO (`spatial`, `object`, `goal`, `10`).
- Percepcion visual: procesa observaciones de imagen como entrada del modelo base OpenVLA-7B.
- Integracion de propiocepcion mediante un proyector propio de cada suite.
- Normalizacion de acciones dependiente de la suite, usando `dataset_statistics.json`.
- Cabezas de accion especificas por suite (no intercambiables entre suites).
- No soporta tool calling ni function calling.
- No esta orientado a agentes conversacionales ni a razonamiento multi-paso en lenguaje natural.
- No hay modo thinking, ni capacidades de audio, ni generacion de texto general.
- Capacidades multilingues: no disponibles (el modelo no es un LLM de proposito general).

## Casos de uso

- Reproduccion de resultados de LIBERO en simulacion: investigar si una representacion de adaptador de rango 64 aproxima suficientemente los checkpoints fusionados publicados de OpenVLA-OFT.
- Servicio multi-tarea con base compartida: cargar una unica copia del backbone de 7B y alternar entre las cuatro suites cargando solo la cabeza, el proyector y los factores correspondientes, reduciendo el uso de memoria agregado frente a cuatro checkpoints fusionados completos.
- Estudios de eficiencia de memoria en inferencia robotica: comparar el coste en disco y en VRAM de adaptadores reconstruidos frente a checkpoints completamente fusionados.
- Investigacion sobre factorizacion de bajo rango: usar los diagnosticos de reconstruccion incluidos y la implementacion FlashTSQR como referencia metodologica para reconstruir otros adaptadores.
- Punto de partida para fine-tuning posterior: aplicar los adaptadores sobre el base oficial y continuar el ajuste en una suite LIBERO concreta con el runtime de OFT.
- Auditoria de pesos: verificar con `apply_adapter.py` y `base_verification.json` que los tensores no objetivo son identicos al base, como parte de un pipeline de validacion de artefactos.
- Pruebas de integracion del runtime LIBERO: comprobar que la cabeza de accion continua, el proyector de propiocepcion, el procesamiento de imagen y la normalizacion de acciones se cargan correctamente antes de escalar a un benchmark completo.

## Benchmarks y rendimiento

La unica validacion publicada es una prueba de humo sobre la tarea ID 0 con ocho estados iniciales por suite. No constituye un benchmark LIBERO completo ni prueba de equivalencia en la distribucion de acciones.

| Suite | Exitos publicados | Exitos reconstruidos | Llamadas a politica (publicado / reconstruido) |
|---|---:|---:|---:|
| spatial | 8/8 | 8/8 | 11 / 11 |
| object | 8/8 | 8/8 | 19 / 19 |
| goal | 8/8 | 8/8 | 18 / 24 |
| 10 | 8/8 | 8/8 | 46 / 51 |

No se publican resultados de MMLU, HumanEval, GSM8K ni de otras suites de LIBERO distintas de la tarea ID 0. El autor indica que no se ha evaluado un sistema de servicio multi-adaptador con base compartida en produccion.

## Requisitos de hardware

- El modelo base OpenVLA-7B en BF16 ocupa aproximadamente 14-15 GB de VRAM; a ello se suman unos 0,44 GB por adaptador y el coste de activaciones y codificador visual (estimacion orientativa, no documentada en el release).
- Cabe en GPU de consumo con 24 GB, como RTX 4090 o RTX 3090, asumiendo el base en BF16 y una sola suite activa; en FP32 el requisito crece por encima de esos 24 GB.
- Para GPU de datacenter, A100 40/80 GB y H100 permiten margen para lotes mayores o varias suites en memoria.
- Opciones de despliegue: el runtime de OpenVLA-OFT para LIBERO con PyTorch. Un decodificador de acciones estandar de OpenVLA es insuficiente. No aplican vLLM, llama.cpp, Ollama ni TGI, al tratarse de un modelo de accion continua y no de un LLM de texto.
- Se requiere cargar por separado las cabezas y estadisticas especificas de cada suite a traves del runtime de OFT.
- Latencia y throughput: no disponibles. El unico dato publicado son recuentos de llamadas por lotes al runner de politica, no pasos de entorno por episodio.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Requiere base | Licencia |
|---|---|---|---|---|
| OpenVLA-7B (base) | 7B | safetensors | no | MIT |
| OpenVLA-OFT, checkpoints fusionados publicados | 7B por suite | safetensors | no | MIT |
| Este release (adaptadores r64 reconstruidos) | 7B (base) + 221,6 M por suite | safetensors (PEFT/LoRA) | si, revision fijada de openvla-7b | MIT |

La comparativa con alternativas fuera de la familia OpenVLA no esta disponible en la informacion proporcionada. Frente a los checkpoints fusionados publicados, este release reduce el almacenamiento por suite a cambio de una aproximacion de rango 64 no sin perdidas y de la dependencia de una revision concreta del base. Frente al base OpenVLA-7B, anade las capacidades especificas de LIBERO mediante adaptadores y cabezas de accion.

## Limitaciones y advertencias

- Los adaptadores son reconstrucciones aproximadas, no los adaptadores de entrenamiento originales del publicador.
- La reconstruccion no es sin perdidas y no debe interpretarse como una compresion adicional del presupuesto de rango.
- Validacion muy limitada: solo la tarea ID 0 con ocho estados iniciales por suite. No hay benchmark LIBERO completo ni prueba de equivalencia en la distribucion de acciones.
- No aplicar el adaptador de forma aditiva estandar sobre los pesos fusionados publicados: el script `apply_adapter.py` sustituye cada tensor objetivo por el tensor base oficial mas el producto en FP32 de los factores, y deja intactos los tensores no objetivo, que deben contener ya los pesos base oficiales.
- La carga PEFT/OFT de extremo a extremo en formato estandar no ha sido validada por este release.
- Las cabezas de tarea y las estadisticas son especificas de cada suite y son obligatorias; sin ellas la inferencia no es valida.
- El sistema de servicio multi-adaptador con base compartida en produccion no ha sido evaluado.
- Repositorio con 0 descargas y 0 me gusta en el momento de la consulta: sin validacion de la comunidad.
- Idiomas soportados no documentados; el modelo no es un generador de texto de proposito general.
- Riesgo de fallo fuera de distribucion: al ser una politica de accion, la generalizacion a estados no vistos no esta garantizada por la prueba de humo.
- Licencia MIT heredada de OpenVLA y OpenVLA-OFT, que permite uso comercial, pero se pide atribuir tambien el trabajo upstream.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LoRAFleet/openvla-oft-libero-reconstructed-r64
- Modelo base: https://huggingface.co/openvla/openvla-7b
- Repositorio OpenVLA-OFT: https://github.com/moojink/openvla-oft
- Documentacion de LIBERO en OpenVLA-OFT: https://github.com/moojink/openvla-oft/blob/main/LIBERO.md
- Repositorio OpenVLA: https://github.com/openvla/openvla
