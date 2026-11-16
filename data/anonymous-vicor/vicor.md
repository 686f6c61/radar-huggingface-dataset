# anonymous-vicor/ViCoR

## Resumen

ViCoR es un sistema de reconocimiento y verificacion de estructuras moleculares a partir de imagenes, publicado de forma anonima bajo el identificador `anonymous-vicor/ViCoR`. No se trata de un unico modelo de Transformers, sino de un paquete de checkpoints que combina dos componentes: MolScribe, un reconocedor imagen-a-grafo, y un verificador/editor derivado de Qwen2.5-VL-3B-Instruct. El pipeline convierte una imagen de una molecula en un grafo estructural, lo verifica de forma iterativa y lo corrige cuando detecta discrepancias, produciendo finalmente SMILES o molfile cuando es posible exportarlos.

El modelo resuelve un problema concreto de la quimica computacional: la transcripcion fiable de estructuras dibujadas (publicaciones, patentes, libretas) a formatos legibles por maquina. La innovacion principal es el bucle de verificacion/edicion multi-ronda sobre un modelo vision-lenguaje de 3B parametros, que actua como revisor del grafo generado por el reconocedor. El checkpoint de ViCoR es un merge completo de Qwen2.5-VL-3B-Instruct, por lo que no requiere adaptadores ni modelo base separado.

El lanzamiento es relevante por su enfoque especializado y por la transparencia del empaquetado: incluye manifiesto de pesos, hashes SHA256 y un entorno de inferencia reproducible. El tamano total del repositorio es de aproximadamente 7,9 GB (decimal) y el runtime esta probado en Linux con Python 3.11, PyTorch 2.10.0, Transformers 5.2.0 y una RTX 3090 de 24 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos componentes: MolScribe (encoder-decoder imagen-a-grafo) + ViCoR (Qwen2.5-VL-3B-Instruct fusionado, vision-lenguaje) |
| Parametros totales | No disponible de forma desagregada; el componente ViCoR deriva de Qwen2.5-VL-3B-Instruct (3B) y MolScribe se distribuye como checkpoint independiente |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en el formato original del checkpoint (no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponibles |
| Licencia | Qwen Research License (componente Qwen, con terminos no comerciales) + Apache-2.0 (componente MolScribe); licencia compuesta `qwen-research-and-apache-2.0` |
| Formato de pesos | `molscribe.pth` (PyTorch) y directorio `vicor/` con pesos merged, processor, tokenizer y prompts; incluye `weights_manifest.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

ViCoR es un pipeline secuencial de dos etapas. La primera etapa es MolScribe, un reconocedor de imagen a grafo que extrae la estructura molecular (atomo y enlaces) de la imagen. La segunda etapa es ViCoR, un modelo vision-lenguaje construido mediante fine-tuning y merge sobre Qwen2.5-VL-3B-Instruct, que recibe el grafo propuesto y ejecuta rondas de verificacion y edicion. El checkpoint de ViCoR es un merge completo: no necesita el modelo base original ni un adaptador LoRA separado en tiempo de inferencia. El runtime carga ambos modelos localmente y de forma secuencial.

No se han publicado en la informacion disponible detalles sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones de decodificacion (decodificacion especulativa, atencion lineal, etc.). La model card indica explicitamente que los pesos y la configuracion de inferencia han sido modificados para la verificacion y revision de grafos moleculares, y que el checkpoint de MolScribe se reempaqueta para inferencia sin cambios en sus tensores.

## Capacidades

- Reconocimiento de estructuras moleculares a partir de imagenes y conversion a grafo (atomo-enlace).
- Verificacion iterativa multi-ronda del grafo propuesto, con respuestas de verificacion y edicion por ronda.
- Edicion y correccion de grafos mal formados o incompletos mediante el componente vision-lenguaje.
- Exportacion a SMILES cuando la estructura es inequivoca y a molfile cuando es exportable.
- Procesamiento por lotes de directorios de imagenes (`--recursive` en la CLI).
- Verificacion de integridad de pesos mediante hashes SHA256 (`vicor.doctor --verify-checksums`).
- Capacidades heredadas de Qwen2.5-VL-3B-Instruct (vision y lenguaje) en la medida en que el fine-tuning las preserve; no se documentan explicitamente en la model card.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico mas alla del bucle interno de verificacion/edicion.

## Casos de uso

- Digitalizacion de literatura quimica: procesar figuras de articulos y patentes para extraer estructuras en SMILES o molfile y alimentar bases de datos quimicas, usando el bucle de verificacion para reducir errores de transcripcion.
- Conversion de libretas y apuntes de laboratorio: transcribir estructuras dibujadas a formatos legibles por maquina, con la salvedad de que las estructuras manuscritas pueden provocar fallos de reconocimiento o verificacion.
- Curacion de datasets quimicos: ejecutar el pipeline en lote sobre directorios de imagenes para generar grafos verificados y detectar discrepancias antes de incorporarlos a un corpus.
- Control de calidad de pipelines OCR quimicos existentes: usar ViCoR como verificador secundario de grafos generados por otras herramientas, comparando el grafo aceptado con el original.
- Analisis de patentes: extraer estructuras de figuras de patentes y exportarlas a molfile para estudios de libertad de operacion o busquedas de similitud estructural.
- Investigacion en reconocimiento de grafos moleculares: servir como baseline reproducible con pesos publicos, manifiesto e hashes para comparar metodos de verificacion imagen-a-grafo.
- Preprocesado para modelos downstream: generar SMILES y molfiles que alimenten modelos de propriedades, docking o retrosintesis, con registro de errores de edicion para filtrar casos dudosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no se publica una cifra exacta; el entorno de referencia probado es una RTX 3090 de 24 GB, lo que sugiere que el pipeline completo cabe en 24 GB.
- GPU recomendadas: RTX 3090 (probada oficialmente); por capacidad, cualquier GPU con al menos 24 GB deberia ser suficiente, aunque no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, al menos en RTX 3090 (24 GB) segun el entorno probado.
- Opciones de despliegue: el paquete incluye su propia CLI (`python -m vicor`) y utilidades (`vicor.download`, `vicor.doctor`); no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Al cargar los dos modelos secuencialmente, el uso de memoria y el tiempo por imagen dependen de la etapa activa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViCoR | 3B (componente VLM) + MolScribe | No disponible | Imagen-a-grafo con verificacion | Qwen Research + Apache-2.0 | Pesos publicos en HF |
| MolScribe (original) | No disponible | No disponible | Imagen-a-grafo | Apache-2.0 | Publico |
| Qwen2.5-VL-3B-Instruct | 3B | No disponible | Vision-lenguaje general | Qwen Research | Publico |

No se dispone de datos de rendimiento comparativo entre ViCoR y estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Un grafo aceptado refleja la decision del verificador, no la correccion frente a la verdad de referencia (ground truth).
- Las estructuras manuscritas, las flechas de mecanismo y las etiquetas simbolicas pueden provocar fallos de reconocimiento o de verificacion.
- Las respuestas de edicion mal formadas se registran como errores y no se corrigen automaticamente.
- Los grupos simbolicos pueden producir SMILES nulo aunque se conserve el grafo.
- La licencia del componente Qwen incluye terminos no comerciales (Qwen Research License); el uso comercial requiere revisar el NOTICE y las condiciones aplicables.
- No se documentan sesgos conocidos, riesgo de alucinacion especifico ni limitaciones de contexto o idioma.
- El modelo se publica de forma anonima, sin autoria ni afiliacion identificadas, lo que dificulta evaluar su procedencia y mantenimiento.
- No se documentan resultados de benchmarks, por lo que la calidad real del pipeline no puede contrastarse con metricas publicas.

## Enlaces

- Hugging Face: https://huggingface.co/anonymous-vicor/ViCoR
- NOTICE de licencias: https://huggingface.co/anonymous-vicor/ViCoR/blob/main/NOTICE
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
