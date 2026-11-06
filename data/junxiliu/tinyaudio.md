# junxiliu/TinyAudio

## Resumen

TinyAudio es un sistema completo de generación de audio a partir de texto (text-to-audio) desarrollado por Junxi Liu y colaboradores, presentado en el artículo arXiv 2609.31525. Su propuesta central es la eficiencia extrema: el sistema completo, incluyendo el codificador de texto, el generador y el decodificador, suma únicamente 87 millones de parámetros y genera audio a 44,1 kHz con un pico de memoria GPU de 0,48 GB. Esto lo sitúa en una categoría muy distinta a la de los modelos de difusión para audio habituales, que suelen requerir varios miles de millones de parámetros y GPUs de gama alta.

El modelo se distribuye en dos variantes de generador: TinyAudio, basado en flow matching con 25 pasos de muestreo, y TinyAudio-MF, una variante MeanFlow que genera audio en un solo paso y que, según el autor, funciona en tiempo real sobre una cuota de cuatro núcleos de CPU. El repositorio incluye además el codificador de texto TA-CLAP (32M), el autoencoder TA-VAE y una exportación ONNX del generador de un paso para inferencia en CPU con ONNX Runtime.

La relevancia actual del modelo reside en su orientación explícita a despliegues de bajos recursos: permite ejecutar generación de audio en hardware de consumo o incluso sin GPU, algo poco habitual en esta tarea. La licencia MIT y la disponibilidad de pesos en PyTorch y ONNX facilitan su integración en productos. No obstante, el modelo solo declara soporte de inglés y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching (TinyAudio) y MeanFlow de un paso (TinyAudio-MF); pipeline con codificador de texto TA-CLAP, generador y decodificador TA-VAE |
| Parametros totales | 87M en el sistema completo (codificador de texto, generador y decodificador); codificador de texto TA-CLAP de 32M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuyen pesos PyTorch en punto flotante y exportacion ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth, .pt) y ONNX (carpeta cpu/standard/) |
| Frecuencia de muestreo de salida | 44,1 kHz |
| Pasos de muestreo | 25 (TinyAudio) y 1 (TinyAudio-MF) |
| Memoria GPU pico | 0,48 GB |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

TinyAudio es un sistema de generación de audio condicionado por texto compuesto por tres módulos: un codificador de texto TA-CLAP de 32M de parámetros, un generador y un decodificador TA-VAE que produce la forma de onda final a 44,1 kHz. El generador se entrena con flow matching y se muestrea en 25 pasos en la variante estándar. La variante TinyAudio-MF aplica MeanFlow, una formulación que permite la generación en un único paso, lo que reduce drásticamente el coste de inferencia y habilita la ejecución en tiempo real sobre CPU.

El artículo se titula "TinyAudio: Compact and Efficient Text-to-Audio Generation for Low-Resource Deployment" y está firmado por Liu, Li, Guan, Duan, Niu, Huo, Ma y Chen (2026). La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineamiento como RLHF o DPO. Tampoco se especifican innovaciones adicionales más allá del uso de MeanFlow para la inferencia de un paso y de la exportación ONNX para despliegue sin PyTorch.

## Capacidades

- Generación de audio a partir de descripciones textuales en inglés, con salida a 44,1 kHz.
- Generación en un solo paso con TinyAudio-MF, orientada a latencia mínima y ejecución en tiempo real.
- Generación de mayor calidad con TinyAudio de 25 pasos de flow matching.
- Inferencia en CPU mediante la exportación ONNX y ONNX Runtime, sin necesidad de PyTorch.
- Ejecución con un pico de memoria GPU de 0,48 GB, apta para GPUs de gama baja.
- Integración mediante API de Python (`TinyAudioPipeline`) y mediante script de línea de comandos (`infer.py`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Efectos de sonido para videojuegos y prototipado: el modelo genera sonidos descritos en texto (por ejemplo, "un perro ladrando mientras pasa un coche") con un coste computacional mínimo, lo que permite iterar rápidamente en el diseño sonoro sin depender de una GPU dedicada.
- Generación de audio en dispositivos de borde: gracias a la variante MeanFlow de un paso y a la exportación ONNX, se puede integrar en aplicaciones de escritorio o sistemas embebidos con CPU de cuatro núcleos, sin acceso a GPU.
- Herramientas de accesibilidad: producción de indicaciones sonoras y ambientes para lectores de pantalla o aplicaciones de apoyo a personas con discapacidad visual, donde el coste por inferencia debe ser bajo.
- Prototipado de doblaje y postproducción: generación rápida de ambientes y efectos para maquetas de audio antes de recurrir a bibliotecas comerciales o a modelos de mayor tamaño.
- Educación y demostraciones: ejecución de un sistema completo de text-to-audio en portátiles convencionales, útil para talleres y cursos sobre modelos generativos de audio.
- Servicios de generación de audio a escala con restricciones de memoria: el pico de 0,48 GB permite multiplexar varias instancias en una sola GPU de gama media o servir peticiones en CPU con latencias controladas.
- Pruebas de integración en pipelines de CI/CD: la exportación ONNX y la licencia MIT facilitan la inclusión del modelo en pruebas automatizadas de generación de audio sin dependencias pesadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0,48 GB de pico en GPU según el autor; en CPU, la variante ONNX de un paso funciona sin GPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre es suficiente en teoría; no se especifican modelos concretos (A100, H100, RTX 4090) porque el modelo está diseñado para hardware de bajos recursos.
- Cabe en GPU de consumo: sí, con amplio margen, dado el pico de 0,48 GB.
- Opciones de despliegue: PyTorch (repositorio oficial con `TinyAudioPipeline`), ONNX Runtime (carpeta `cpu/standard/`) y scripts de línea de comandos (`infer.py`, `cpu/tinyaudio_onnx.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: el autor afirma que TinyAudio-MF genera audio en tiempo real sobre una cuota de cuatro núcleos de CPU; no se proporcionan cifras concretas de latencia ni de throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni comparaciones con otros sistemas de text-to-audio, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; no se documenta comportamiento multilingüe.
- No se han publicado benchmarks, por lo que la calidad objetiva del audio generado no puede evaluarse a partir de la información disponible.
- El tamaño reducido (87M de parámetros en total) implica previsiblemente una fidelidad y un realismo inferiores a los de modelos de difusión de mayor escala; no se dispone de datos que lo cuantifiquen.
- No se documentan sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo en los sonidos generados.
- Riesgo de alucinación y de generar audio incoherente con la descripción textual en prompts ambiguos o poco representados en el entrenamiento; no cuantificado.
- La licencia MIT permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar las licencias de los componentes (TA-CLAP, TA-VAE) y de los datos de entrenamiento antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo se creó en octubre de 2026; se trata de un lanzamiento muy reciente con poca validación externa.
- No se documentan limitaciones de longitud de contexto ni de duración máxima del audio generado.

## Enlaces

- Hugging Face: https://huggingface.co/junxiliu/TinyAudio
- Paper: https://arxiv.org/abs/2609.31525
- Código: https://github.com/junxi25liu/TinyAudio
- Demo: https://tinyaudio-project.github.io/
