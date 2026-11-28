# SceneWorks/scail2-candle

## Resumen

scail2-candle es una conversión al ecosistema Candle (framework de tensores en Rust) del modelo SceneWorks/scail2-mlx, que a su vez es un ajuste fino (finetune) del modelo base zai-org/SCAIL-2. El repositorio lo publica el usuario SceneWorks y su propósito es ofrecer pesos en formato GGML/GGUF por bloques cuantizados, listos para ser consumidos por la librería Candle en plataformas Windows y Linux. La model card indica explícitamente que macOS se cubre con las variantes MLX del mismo autor, por lo que este repositorio es la rama de despliegue nativa para entornos no Apple.

El paquete incluye dos niveles de cuantización: un tier q4 obtenido de forma sin pérdida (lossless) a partir del tier q4 de MLX y un tier q8 generado por cuantización Q8_0 desde los pesos bf16. Además del componente principal (denominado dit.safetensors en la documentación), el repositorio contiene componentes densos (sin cuantizar) para clip, t5_encoder y vae, lo que sugiere una arquitectura de tipo difusión con codificadores de texto e imagen. El tamaño del repositorio es de 42,7 GB.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de inferencia en Rust/Candle para un modelo de difusión ajustado; por otro, advierte de que la información pública disponible es muy escasa (sin pipeline declarado, sin idiomas, sin benchmarks y con cero descargas), por lo que muchas especificaciones deben marcarse como no disponibles. Cualquier evaluación de producción debería partir de la model card del modelo base zai-org/SCAIL-2 y del repositorio MLX de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card menciona componentes dit, clip, t5_encoder y vae, compatibles con un pipeline de difusion, pero no se detalla la arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4 (Q4_1, conversion sin perdida desde MLX q4) y q8 (Q8_0 desde bf16); componentes clip, t5_encoder y vae en denso |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGML/GGUF por bloques (tensores U8 con forma [out, in/32, block_bytes]) para lineales cuantizados; safetensors para el resto de componentes |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base zai-org/SCAIL-2 ni del finetune SceneWorks/scail2-mlx. La model card de esta conversión solo detalla el proceso de empaquetado: cada capa lineal cuantizada se almacena como un único tensor U8 `{base}.weight` con forma [out, in/32, block_bytes], y el archivo config.json incluye un campo `quantization: {bits, storage: ggml}`. El tier q4 se obtiene de forma sin pérdida desde el tier q4 de MLX, mientras que el tier q8 se cuantiza a Q8_0 desde los pesos bf16 originales (dit.safetensors). Los componentes clip, t5_encoder y vae se mantienen densos.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas del modelo base. La conversión se realizó con la herramienta candle_gen::ggml_tier del repositorio SceneWorks/inference. Cualquier afirmación sobre el entrenamiento del modelo subyacente requeriría consultar la model card de zai-org/SCAIL-2, que no forma parte de la información proporcionada.

## Capacidades

- Generación de contenido multimodal: la presencia de codificadores clip y t5_encoder junto con un vae y un componente dit sugiere un pipeline de difusión texto-a-imagen o texto-a-vídeo, aunque la model card no lo confirma explícitamente.
- Inferencia nativa en Rust mediante Candle, con soporte para pesos GGML por bloques.
- Ejecución en Windows y Linux (macOS se cubre con los tiers MLX del mismo autor).
- Dos niveles de cuantización (q4 y q8) para ajustar el equilibrio entre calidad y memoria.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Despliegue de inferencia en Rust: integración del modelo en aplicaciones nativas escritas en Rust usando Candle, sin depender de Python ni de CUDA a través de PyTorch, adecuado para productos de escritorio o servicios embebidos en Windows y Linux.
- Pipeline de generación de imágenes o vídeo en servidores Linux: uso del tier q8 para mantener mayor fidelidad y del q4 para reducir huella de memoria en máquinas con VRAM limitada.
- Prototipado multiplataforma: empleo de los tiers MLX en macOS y de estos tiers Candle en Windows/Linux dentro del mismo producto, manteniendo coherencia de pesos entre plataformas.
- Investigación sobre cuantización GGML: el repositorio sirve como referencia para estudiar la conversión sin pérdida de Q4_1 desde MLX y la cuantización Q8_0 desde bf16 en un pipeline de difusión con codificadores densos.
- Aplicaciones de escritorio con requisitos de privacidad: al ejecutarse localmente con Candle, permite generar contenido sin enviar datos a servicios en la nube.
- Evaluación comparativa de backends: comparar latencia y calidad entre la ruta MLX (macOS) y la ruta Candle/GGML (Windows/Linux) para un mismo modelo ajustado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, el repositorio completo ocupa 42,7 GB, pero ese tamaño incluye todos los tiers y componentes; la VRAM real dependerá del tier cargado (q4 o q8) y de si se mantienen densos clip, t5_encoder y vae.
- GPU recomendadas: no disponibles en la documentación. Por el tamaño del repositorio, es plausible que los tiers q8 requieran GPUs de clase profesional (A100, H100) o consumer de gama alta con suficiente VRAM, pero el autor no lo especifica.
- ¿Cabe en GPU consumer? No confirmado. El tier q4 podría ser viable en GPUs consumer con VRAM amplia, pero no hay datos oficiales.
- Opciones de despliegue: Candle (librería nativa en Rust) es el backend declarado; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y su aplicabilidad a un pipeline de difusión no está documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SceneWorks/scail2-candle | no disponible | no disponible | GGML/GGUF por bloques + safetensors | MIT | Conversion Candle para Windows/Linux |
| SceneWorks/scail2-mlx | no disponible | no disponible | MLX | no disponible | Version de referencia para macOS; misma base |
| zai-org/SCAIL-2 | no disponible | no disponible | no disponible | no disponible | Modelo base del finetune |

No se dispone de información suficiente para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría. La comparativa se limita a la relación entre el modelo base y sus dos conversiones.

## Limitaciones y advertencias

- Información pública muy escasa: sin pipeline declarado, sin idiomas, sin benchmarks y con cero descargas y likes en el momento de la consulta.
- El repositorio no documenta sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas; al tratarse de un pipeline de difusión, los riesgos relevantes serían de sesgo visual y de fidelidad a la instrucción, no evaluados aquí.
- La licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo base zai-org/SCAIL-2, ya que el finetune hereda posibles restricciones adicionales no reflejadas en este repositorio.
- La model card advierte de que macOS debe usar los tiers MLX; intentar ejecutar estos pesos Candle en macOS no es el camino soportado.
- El tier q4 es una conversión sin pérdida desde MLX q4, pero la calidad final depende de la cuantización original; el tier q8 es una cuantización Q8_0 desde bf16 y puede presentar diferencias menores frente al modelo en bf16.
- No hay garantías de mantenimiento, soporte ni actualizaciones; el repositorio se creó y actualizó en la misma fecha (27 de noviembre de 2026).
- Para producción, es imprescindible validar el pipeline completo (dit, clip, t5_encoder, vae) y medir latencia y calidad en el hardware objetivo antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SceneWorks/scail2-candle
- Modelo base: https://huggingface.co/zai-org/SCAIL-2
- Repositorio MLX de referencia (citado en la model card): SceneWorks/scail2-mlx en el commit ce88cfdb1008f395e9c820e525e6db7b6695f7b3 (no se proporciona URL directa en la información disponible)
- Repositorio de herramientas de inferencia (citado): SceneWorks/inference (no se proporciona URL directa en la información disponible)
- Framework Candle: no se proporciona URL en la información disponible
