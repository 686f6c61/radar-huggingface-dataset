# Kinemiq/Llama-3-KinemIQ-Motion

## Resumen

Kinemiq/Llama-3-KinemIQ-Motion es un modelo de generación de movimiento a partir de texto (text-to-motion) publicado por Kinemiq, el equipo detrás de KinemIQ Studio. Según la model card, no se trata de un modelo de lenguaje en sentido estricto, pese a su nombre: es el modelo de movimiento de NVIDIA Kimodo (versión Kimodo-SOMA-RP-v1.2) exportado a ONNX para ejecutarse en el navegador mediante onnxruntime-web con WebGPU, con pesos en float16 y almacenados como dos planos de bytes comprimidos con gzip.

El modelo resuelve la conversión de una descripción textual en una secuencia de movimiento esquelético, pensada para animación interactiva en el navegador. Su interés actual reside en el formato de despliegue: un artefacto ONNX optimizado para WebGPU que permite inferencia local en el cliente sin servidor, algo poco habitual en esta categoría. El repositorio ocupa 0,5 GB y no registra descargas ni likes en el momento de la consulta.

La información pública disponible es muy limitada: la model card no documenta arquitectura interna, número de parámetros, longitud de contexto textual ni idiomas soportados. La licencia declarada es la NVIDIA Open Model License, con la mención adicional de que el modelo se construyó con Meta Llama 3 bajo la Meta Llama 3 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de movimiento Kimodo-SOMA-RP-v1.2 exportado a ONNX; no se detalla la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float16 (pesos exportados en FP16); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license); componente base Meta Llama 3 bajo Meta Llama 3 Community License |
| Formato de pesos | ONNX para onnxruntime-web (WebGPU); pesos almacenados como dos planos de bytes comprimidos con gzip descritos en manifest.json |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original Kimodo-SOMA-RP-v1.2 de NVIDIA ni sobre su proceso de entrenamiento. La model card únicamente indica que se trata de un modelo de movimiento (text-to-motion) y que ha sido exportado a ONNX para su ejecución en navegador con onnxruntime-web y WebGPU, con pesos en float16. El archivo principal de pesos se distribuye como dos planos de bytes comprimidos con gzip, referenciados desde un manifest.json, lo que sugiere una estrategia de carga por partes orientada a reducir el tamaño de descarga en el cliente.

Tampoco se documentan el volumen de datos de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino con preferencias humanas (RLHF/DPO). La model card menciona que los vectores del banco de prompts se generaron con el codificador de texto de Kimodo, pero no se aportan detalles sobre dicho codificador. Cualquier afirmación sobre innovaciones técnicas (atención lineal, decodificación especulativa, etc.) carecería de respaldo en la información disponible.

## Capacidades

- Generación de movimiento a partir de texto: convierte descripciones textuales en secuencias de movimiento para animación, según el propósito declarado del modelo.
- Ejecución en navegador: el formato ONNX con onnxruntime-web y WebGPU permite inferencia local en el cliente, sin depender de un servidor.
- Pesos en float16: orientados a reducir el uso de memoria y el tamaño de descarga en el navegador.
- Carga por planos comprimidos: los pesos se distribuyen como dos planos de bytes con gzip y un manifest.json, lo que facilita la carga fragmentada.
- Banco de prompts precalculado: la model card indica que los vectores del banco de prompts se generaron con el codificador de texto de Kimodo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Animación interactiva en el navegador: el modelo puede integrarse en aplicaciones web que generen animaciones esqueléticas a partir de texto sin backend, usando onnxruntime-web con WebGPU; el formato ONNX y los pesos FP16 están pensados exactamente para este escenario.
- Herramientas de creación de contenido para animadores: un estudio podría ofrecer una función "desde texto" que produzca borradores de movimiento para iterar rápidamente antes de un refinado manual, como hace KinemIQ Studio en su función "From text".
- Prototipado de personajes y previsualización: equipos de videojuegos o producción audiovisual pueden generar movimientos preliminares para validar ideas de escenas sin pipeline de captura de movimiento.
- Demos y experiencias educativas: al ejecutarse en el cliente, permite publicar demostraciones de text-to-motion en webs estáticas o entornos con recursos limitados de servidor.
- Aplicaciones offline o con requisitos de privacidad: la inferencia local en el navegador evita enviar los prompts a un servidor, útil en contextos donde el texto del usuario es sensible.
- Integración en editores 3D basados en web: el modelo puede conectarse a visores o editores de escenas en el navegador que consuman directamente las secuencias de movimiento generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,5 GB y los pesos se distribuyen en float16, pero no se detalla el consumo de memoria en ejecución.
- GPU recomendadas: no disponible. El modelo está orientado a WebGPU, por lo que requiere un navegador con soporte de WebGPU y una GPU compatible; no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible; la model card no indica requisitos mínimos ni GPUs verificadas.
- Opciones de despliegue: onnxruntime-web con WebGPU (entorno previsto por el autor). No se documentan otros runtimes (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de text-to-motion ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Información técnica muy escasa: no se documentan arquitectura, parámetros, contexto, idiomas ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para producción.
- Licencia restrictiva y compuesta: el modelo se distribuye bajo la NVIDIA Open Model License y declara haberse construido con Meta Llama 3, sujeto a la Meta Llama 3 Community License; es necesario revisar ambas licencias antes de cualquier uso comercial.
- Dependencia de WebGPU: el despliegue previsto exige un navegador con soporte de WebGPU; en entornos sin esta API el modelo no puede ejecutarse según lo documentado.
- Sin métricas publicadas: no hay benchmarks ni evaluaciones de calidad del movimiento generado, por lo que el riesgo de resultados pobres o inconsistentes no puede cuantificarse.
- Riesgo de sesgos y alucinación: no evaluable con la información disponible; al ser un modelo generativo de movimiento, puede producir animaciones no realistas o no ajustadas al prompt.
- Cero adopción registrada: el repositorio no tiene descargas ni likes, lo que reduce la evidencia externa sobre su funcionamiento.
- Nombre potencialmente engañoso: pese a incluir "Llama-3" en el identificador, no es un modelo de lenguaje y no debe evaluarse como tal.

## Enlaces

- Hugging Face: https://huggingface.co/Kinemiq/Llama-3-KinemIQ-Motion
- Aplicación del autor (text-to-animation): https://kinemiq.app/text-to-animation/
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
