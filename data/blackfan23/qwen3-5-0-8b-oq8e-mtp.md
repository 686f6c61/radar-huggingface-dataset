# blackfan23/Qwen3.5-0.8B-oQ8e-mtp

## Resumen

Qwen3.5-0.8B es el modelo más pequeño de la familia Qwen3.5, desarrollada por Alibaba Cloud. Esta familia destaca por adoptar una arquitectura híbrida que combina atención lineal con transformadores tradicionales, lo que permite ventanas de contexto de hasta 262.144 tokens con un coste computacional reducido. El modelo mantiene las capacidades multimodales nativas del resto de la familia, procesando texto, imagen y vídeo, a pesar de su tamaño compacto de aproximadamente 320 millones de parámetros.

La relevancia de este modelo radica en su versatilidad: por un lado, es lo suficientemente pequeño para ejecutarse en dispositivos de borde y hardware de consumo; por otro, su arquitectura híbrida y su ventana de contexto amplia lo convierten en un candidato ideal como modelo borrador (draft model) para decodificación especulativa junto a los checkpoints más grandes de la familia Qwen3.5. La versión aquí descrita, publicada por el usuario blackfan23, es una cuantización de precisión mixta de 8 bits realizada con la herramienta oQ de oMLX, orientada a su ejecución eficiente en hardware Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: gated delta networks (atención lineal) + transformador |
| Parametros totales | 319.825.472 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 8 bits, grupo de 64 (oQ mixed-precision) |
| Idiomas soportados | no disponible (multilingüe, pendiente de confirmar lista oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La familia Qwen3.5 introduce una arquitectura híbrida que combina mecanismos de atención lineal, concretamente gated delta networks, con capas transformer tradicionales. Este diseño busca reducir la complejidad cuadrática de la atención estándar, permitiendo manejar contextos de 262K tokens de forma más eficiente. El modelo base fue entrenado con un enfoque de fusión temprana de tokens multimodales, lo que le permite procesar texto, imagen y vídeo de manera unificada sin necesidad de módulos separados.

El entrenamiento del modelo base incluye fases de preentrenamiento y ajuste fino, con técnicas de alineación que no se detallan en la información disponible. La versión cuantizada que nos ocupa fue generada con oQ (oMLX v0.6.3rc2), una herramienta de cuantización de precisión mixta que asigna dinámicamente el número de bits por capa según su sensibilidad, logrando una compresión a 8 bits con grupo de tamaño 64. El resultado es un modelo optimizado para el ecosistema MLX de Apple, con un tamaño de repositorio de 1.0 GB.

## Capacidades

- Generación de texto y razonamiento multilingüe, con capacidades comparables a modelos de mayor tamaño dentro de su rango de parámetros.
- Procesamiento multimodal nativo: entrada de texto, imagen y vídeo gracias a la fusión temprana de tokens multimodales durante el entrenamiento.
- Razonamiento, codificación y capacidades de agente, con rendimiento que supera a los modelos Qwen3-VL en benchmarks de comprensión visual.
- Ventana de contexto de 262.144 tokens, adecuada para tareas que requieren procesar documentos extensos o conversaciones de muchos turnos.
- Adecuado como modelo borrador para decodificación especulativa junto a los checkpoints más grandes de Qwen3.5, acelerando la inferencia de estos últimos.
- Ejecución eficiente en hardware Apple Silicon gracias a la cuantización MLX de 8 bits.

## Casos de uso

- Asistentes conversacionales en dispositivos de borde: su tamaño compacto y su ventana de contexto amplia permiten desplegar asistentes locales en móviles o dispositivos embebidos que mantengan el historial de conversaciones largas sin degradación.
- Modelo borrador para decodificación especulativa: al ser el miembro más pequeño de la familia, puede usarse para generar borradores de tokens que luego verifica un modelo mayor de Qwen3.5, reduciendo la latencia de inferencia en producción.
- Análisis de documentos extensos: con 262K tokens de contexto, puede resumir o extraer información de libros completos, expedientes legales o informes técnicos largos en una sola pasada.
- Clasificación y moderación de contenido multimodal: su capacidad para procesar texto e imágenes lo hace útil para filtrar contenido en plataformas sociales o foros, funcionando como un primer filtro automático.
- Prototipado rápido de aplicaciones de IA: por su licencia Apache 2.0 y su tamaño reducido, es ideal para validar ideas y construir prototipos funcionales sin necesidad de infraestructura costosa.
- Automatización de tareas de codificación en entornos con recursos limitados: puede asistir en la generación y revisión de código en editores o entornos de desarrollo integrados que se ejecutan en portátiles sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación oficial de la familia Qwen3.5 indica que el modelo base supera a los modelos Qwen3-VL en razonamiento, codificación, agentes y comprensión visual, pero no se proporcionan cifras concretas para esta variante de 0.8B.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,6-0,8 GB para el modelo cuantizado a 8 bits, considerando el tamaño de los pesos (319M parámetros) y la sobrecarga de la ventana de contexto.
- GPU recomendadas: cualquier GPU Apple Silicon (M1 o superior) gracias al formato MLX; también puede ejecutarse en CPU en escenarios de baja latencia.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna con 4 GB o más de VRAM, incluyendo las integradas de Apple Silicon.
- Opciones de despliegue: MLX (Apple Silicon), vLLM (con soporte para la arquitectura Qwen3.5), llama.cpp y TGI.
- Latencia y throughput: no disponible, aunque su tamaño reducido sugiere una latencia baja incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (este) | 319M | 262K | Híbrida (gated delta + transformer) | Apache 2.0 | MLX safetensors |
| Qwen3-0.6B | 600M | 32K | Transformer densa | Apache 2.0 | safetensors, GGUF |
| SmolLM2-360M | 360M | 8K | Transformer densa | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B | 1.2B | 128K | Transformer densa | Llama 3.2 | safetensors, GGUF |

La comparativa muestra que Qwen3.5-0.8B ofrece una ventana de contexto muy superior a la de sus competidores directos en el rango de 300M-1B parámetros, gracias a su arquitectura híbrida. Su licencia Apache 2.0 lo hace más permisivo que Llama-3.2-1B, que tiene restricciones de uso comercial. La desventaja principal es la disponibilidad limitada de formatos: solo MLX safetensors, frente a la amplia compatibilidad de GGUF de los otros modelos.

## Limitaciones y advertencias

- Al ser el modelo más pequeño de la familia, su rendimiento en tareas complejas de razonamiento o generación de código será inferior al de los modelos de mayor tamaño de Qwen3.5.
- La cuantización a 8 bits puede introducir una ligera degradación en la calidad de las respuestas en comparación con el modelo en precisión completa.
- El formato MLX safetensors limita su uso a hardware Apple Silicon; para otras plataformas sería necesario convertir los pesos a GGUF u otro formato.
- No se dispone de información detallada sobre los datos de entrenamiento, por lo que no es posible evaluar sesgos potenciales o limitaciones idiomáticas específicas.
- La información sobre el modelo base es limitada: no se han publicado papers técnicos detallados ni benchmarks oficiales desglosados por tamaño de modelo.
- El repositorio de HuggingFace no incluye ejemplos de uso ni documentación adicional más allá de la model card básica.

## Enlaces

- Modelo cuantizado: https://huggingface.co/blackfan23/Qwen3.5-0.8B-oQ8e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Guía de vLLM para Qwen3.5-0.8B: https://recipes.vllm.ai/Qwen/Qwen3.5-0.8B
- Guía completa de Qwen 3.5 (modelos, benchmarks y setup): https://qwen-ai.com/qwen-3-5/
- Herramienta de cuantización oQ: https://github.com/jundot/omlx
