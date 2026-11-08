# chenzs/10Eros-Max-H3-beta5-NonTurbo

## Resumen

10Eros-Max-H3-beta5-NonTurbo es un modelo de generación de vídeo a partir de texto e imagen, publicado por el usuario chenzs en Hugging Face. Se trata de un fine-tune del modelo base MiniMaxAI/MiniMax-H3, un modelo de difusión para vídeo, y se distribuye como una variante "non-turbo" dentro de la familia 10Eros-Max, un proyecto experimental que el autor describe como una integración de pruebas (betas) previa a la consolidación de su línea principal "Sulphur H3" (v1.0). El repositorio ocupa 40,2 GB y no registra descargas ni likes en el momento de la consulta.

La propuesta técnica del modelo es un injerto (grafting) de conceptos y LoRAs sobre el modelo base H3, con el objetivo de añadir capacidades sin degradar la calidad visual y de audio del original. Según la model card, esta beta_5 se construye a partir de siete injertos agrupados por concepto y fusiones por consenso de más de 20 LoRAs, sin fusiones directas de LoRA, y emplea una técnica de normalización distinta a las versiones anteriores. La variante NonTurbo está pensada para usarse con turbos externos (por ejemplo, Pika) o con configuraciones de muestreo de paso completo.

Es relevante porque documenta un flujo de trabajo de investigación abierta sobre modelos de vídeo de gran tamaño: el autor libera la metodología de grafting y enlaza un workflow de ComfyUI optimizado, además de versiones int8 alojadas por terceros. No obstante, el propio autor advierte de que las betas son integraciones de prueba y que la calidad depende críticamente de la configuración de muestreo y del prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo (base MiniMax-H3); estructura "fl2va" con timestep Fast Omni, refolded; merge MLP-only con atención y referencia del modelo base intactas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Versión int8 disponible en repositorio de terceros (cicalooo/10Eros-Max-h3-int8-convrot); pesos principales en safetensors |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (licencia comunitaria de MiniMax H3) |
| Formato de pesos | safetensors (repo de 40,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de MiniMaxAI/MiniMax-H3, un modelo de difusión para generación de vídeo, y se construye mediante una estrategia de fusión denominada grafting. Según la model card, beta_5 combina siete injertos agrupados por concepto y fusiones por consenso derivadas de más de 20 LoRAs, sin fusionar directamente las LoRAs. Los injertos se aplican a las capas de atención a bajo nivel para no perturbar la salida visual ni de audio del H3 original. La fusión se limita a datos del lado de la puerta (gate-side) en las capas MLP, de modo que el comportamiento del modelo base permanece intacto y los datos adicionales solo se activan con prompts adecuados.

La base es un modelo "fl2va" con timestep Fast Omni, posteriormente refolded, lo que permite una hibridación completa. El autor señala como limitación estructural la necesidad de VSA (atención dispersa) con un 90 % de sparsity y algunos problemas no diagnosticados de la estructura Omni, en particular el "flickering" (parpadeo) de fondo en flujos de una sola pasada sin muestreo refinado. La versión beta_5 introduce una técnica de normalización distinta y ofrece una variante NonTurbo sin el delta de turbo híbrido incorporado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video) y de imagen más texto (image-text-to-video), según el pipeline declarado.
- Generación de audio asociada al vídeo, con calidad superior en las versiones non-turbo de paso completo frente a las versiones turbo.
- Hibridación de conceptos y estilos procedentes de otros modelos (se citan LTX 2.3, Wan 2.2 y Krea 2) mediante injertos.
- Compatibilidad con LoRAs de concepto adicionales, que suelen requerir intensidades bajas (0,2-0,6).
- Muestreo configurable con distintos samplers y schedulers: er_sde/beta, res_multistep/simple, LCM/simple, LCM/beta y Euler/simple, en rangos de 4 a 8 pasos.
- Soporte de flujos de dos pasadas (2-pass sampling) y de upscale espacial 3D para suavizar el latente y eliminar el parpadeo.
- No se documentan capacidades de tool calling, agentes, razonamiento multietapa ni multilingüismo.

## Casos de uso

- Generación de clips de vídeo con audio para prototipado creativo: el modelo produce vídeo y audio en una sola pasada con samplers como res_multistep/simple a 6-8 pasos, adecuado para previsualizar ideas antes de una producción final.
- Animación de imágenes fijas (image-to-video): útil para dar movimiento a ilustraciones o fotografías con control por prompt, aprovechando la modalidad image-text-to-video del pipeline.
- Transferencia de estilo y concepto entre modelos: los injertos permiten incorporar estéticas de LTX 2.3, Wan 2.2 o Krea 2, lo que sirve para experimentar con direcciones visuales híbridas.
- Investigación sobre fusión de modelos de difusión: el autor publica la metodología de grafting, por lo que el modelo sirve como caso de estudio reproducible para quienes investigan merges MLP-only y fusión por consenso.
- Flujos de trabajo en ComfyUI: el workflow optimizado enlazado en la model card permite integrar el modelo en pipelines de nodos con muestreo de dos pasadas y upscale 3D.
- Generación de vídeo de gran resolución: según la model card, la corrección del parpadeo permite generaciones de gran número de megapíxeles en una sola pasada sin degradación, útil para material de stock o fondos animados.
- Experimentación con turbos externos: la variante NonTurbo está diseñada para combinarse con turbos de terceros (Pika u otros), lo que permite ajustar el equilibrio entre velocidad y calidad en entornos de iteración rápida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 40,2 GB, lo que da una estimación mínima de VRAM en el orden de decenas de gigabytes para cargar los pesos en precisión completa; no se dispone de cifras oficiales de VRAM.
- Existe una versión int8 publicada por un tercero (cicalooo/10Eros-Max-h3-int8-convrot) que reduce el requisito de memoria, aunque no se documentan cifras concretas.
- No se especifican GPU recomendadas (A100, H100, RTX 4090 u otras) en la información disponible.
- No se confirma que quepa en GPU de consumo; el tamaño del repo sugiere que se necesitan GPUs de gama alta o profesionales, pero es una inferencia, no un dato del autor.
- Opciones de despliegue: el autor enlaza un workflow para ComfyUI (SampleWorkFlowTwoPassOptimized); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles. El autor indica rangos de pasos de muestreo (4-8 pasos en configuraciones turbo, 8-12 en configuraciones de referencia) pero no tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 10Eros-Max-H3-beta5-NonTurbo | Difusión vídeo (fine-tune de MiniMax-H3) | no disponible | no disponible | minimax-h3-community-license-agreement | Hugging Face (chenzs) |
| MiniMaxAI/MiniMax-H3 | Difusión vídeo (base) | no disponible | no disponible | minimax-h3-community-license-agreement | Hugging Face (MiniMaxAI) |
| TenStrip/10Eros-Max | Difusión vídeo (variante TURBO-hybrid beta5 int8) | no disponible | no disponible | no disponible | Hugging Face (TenStrip) |
| LTX 2.3 / Wan 2.2 / Krea 2 | Difusión vídeo (origen de conceptos injertados) | no disponible | no disponible | no disponible | no disponible |

La comparación se limita a variantes del mismo linaje, ya que no se dispone de datos de rendimiento ni de parámetros de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- El autor califica explícitamente las betas como integraciones de prueba y advierte de que beta_4 y beta_3 están corruptas; solo beta_5 se considera funcional.
- El "flickering" de fondo en el latente es un problema conocido en flujos de una sola pasada sin muestreo refinado; se mitiga con upscale espacial 3D o con dos pasadas.
- La estructura Omni presenta problemas no diagnosticados que pueden provocar comportamientos extraños según la mezcla de datos.
- El uso de caché o de spectrum durante la generación con referencia causa pérdida de precisión y debe evitarse.
- La sparsity SLA "destruye" el modelo según la model card y debe evitarse en cualquier workflow.
- La calidad depende críticamente del prompt y de la configuración de muestreo; no hay garantías de resultados estables entre configuraciones.
- No se documentan sesgos conocidos ni evaluación de alucinación; al ser un modelo de vídeo, el riesgo principal es la generación de contenido visual inexacto o no fiel al prompt.
- La licencia es la licencia comunitaria de MiniMax H3, que restringe el uso comercial según sus términos; además, al incorporar material transferido de LTX 2.3, Wan 2.2 y Krea 2, el autor indica que se aplican también las licencias comunitarias de esos modelos.
- No hay información sobre idiomas soportados ni sobre evaluación multilingüe.
- El proyecto es evolutivo y el autor prevé migrar a "Sulphur H3" para la v1.0, por lo que esta beta puede quedar obsoleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenzs/10Eros-Max-H3-beta5-NonTurbo
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Workflow de ComfyUI: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/tree/main/SampleWorkFlowTwoPassOptimized
- Versión int8: https://huggingface.co/cicalooo/10Eros-Max-h3-int8-convrot
- Variante TURBO-hybrid beta5 int8: https://huggingface.co/TenStrip/10Eros-Max/blob/main/10Eros_Max_h3_TURBO-hybrid_beta5_int8.safetensors
- Repositorio TenStrip/10Eros-Max: https://huggingface.co/TenStrip/10Eros-Max/tree/main
