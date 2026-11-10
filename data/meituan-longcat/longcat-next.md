# meituan-longcat/LongCat-Next

## Resumen

LongCat-Next es un modelo fundacional multimodal nativo desarrollado por Meituan LongCat que procesa texto, visión y audio bajo un único objetivo autorregresivo, sin depender de adaptadores específicos por modalidad. Se construye sobre el backbone MoE LongCat-Flash-Lite con configuración A3B (aproximadamente 74.000 millones de parámetros totales), y su propuesta central es el paradigma DiNA (Discrete Native Autoregression), que extiende la predicción del siguiente token del lenguaje a un espacio de tokens discreto compartido entre modalidades.

La innovación técnica más destacada es el uso de representaciones visuales discretas semánticamente completas, combinando encoders SAE (Semantic-and-Aligned Encoders) con cuantización vectorial residual (RVQ), junto con dNaViT, un Vision Transformer de resolución nativa que actúa como interfaz discreta flexible para visión. Según el autor, este enfoque supera el techo de rendimiento histórico del modelado visual discreto en tareas de comprensión y unifica comprensión y generación visual en una sola arquitectura.

El modelo se publica con licencia MIT, lo que lo hace especialmente atractivo para investigación y uso comercial, y se distribuye junto con sus tokenizers. Es relevante ahora porque representa un intento industrial de multimodalidad nativa completamente discreta, una alternativa a las arquitecturas con encoders congelados y proyectores, y porque libera pesos y herramientas bajo una licencia permisiva poco habitual en modelos de esta escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (LongCat-Flash-Lite, configuración A3B) con paradigma DiNA autorregresivo discreto multimodal |
| Parámetros totales | 74.257.230.752 (74,26 mil millones) |
| Parámetros activos | no disponible (configuración A3B, valor exacto no especificado) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `LongCat-Next`, `custom_code`) |

## Arquitectura y entrenamiento

LongCat-Next se apoya en un backbone transformer con mezcla de expertos (MoE) denominado LongCat-Flash-Lite, en configuración A3B, que actúa como aprendiz multitarea. Sobre esa base, el modelo unifica lenguaje, visión y audio en un único marco discreto: cada modalidad dispone de un par tokenizer-detokenizer consciente de la modalidad, y todos los tokens se internalizan en un espacio de embedding discreto compartido. La visión se representa mediante dNaViT, un Vision Transformer de resolución nativa que extrae "palabras visuales" con tokenización y detokenización dinámicas, y se apoya en encoders SAE combinados con RVQ para producir tokens jerárquicos que preservan abstracción semántica y detalle fino.

El entrenamiento sigue el paradigma DiNA, que extiende la predicción del siguiente token del lenguaje a las demás modalidades y reutiliza la infraestructura de entrenamiento de LLM. El autor menciona experimentos extensos para analizar este paradigma unificado, pero no detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autorregresiva dentro de un marco multimodal unificado.
- Comprensión visual: interpretación de imágenes mediante tokens visuales discretos jerárquicos.
- Generación de imágenes: el modelo "crea" contenido visual, según la descripción del autor de "seeing, creating, and talking".
- Procesamiento de audio dentro del mismo objetivo autorregresivo discreto.
- Multimodalidad any-to-any: pipeline declarado como `any-to-any`, lo que implica conversión entre modalidades de entrada y salida.
- Tokenización y detokenización dinámica de visión mediante dNaViT.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio especial: visión y audio confirmados; modo thinking no disponible.

## Casos de uso

- Descripción y análisis de imágenes a gran escala: el modelo puede procesar imágenes tokenizadas de resolución nativa mediante dNaViT y generar descripciones o respuestas textuales, lo que resulta adecuado para pipelines de etiquetado automático y moderación de contenido visual.
- Generación de imágenes a partir de instrucciones: al unificar comprensión y generación visual en un mismo espacio discreto, permite construir aplicaciones de creación de imágenes condicionadas por texto sin cambiar de arquitectura.
- Asistentes multimodales conversacionales: combinando entrada de texto, imagen y audio, el modelo puede sostener diálogos donde el usuario adjunta capturas, fotos o clips de voz, aprovechando el objetivo autorregresivo único.
- Transcripción y respuesta sobre audio: al tratar el audio como extensión del lenguaje, es apto para aplicaciones de resumen de reuniones o atención por voz que requieran generar texto a partir de audio.
- Investigación en representaciones discretas multimodales: la liberación de pesos y tokenizers bajo MIT facilita reproducir y extender el paradigma DiNA en laboratorios académicos.
- Prototipado de productos any-to-any: equipos que necesiten convertir entre modalidades (texto a imagen, imagen a texto, audio a texto) pueden usar un único checkpoint en lugar de orquestar varios modelos especializados.
- Fine-tuning comercial: la licencia MIT permite adaptar el modelo a dominios verticales (retail, turismo, atención al cliente) sin las restricciones de licencias de otros modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 74.257 millones de parámetros, en precisión BF16 se requieren aproximadamente 148 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits bajaría a unos 74 GB y en 4 bits a unos 37 GB, aunque los tipos de cuantización no están confirmados por el autor.
- GPU recomendadas: para BF16 se necesitan múltiples aceleradores de clase数据中心, como varias A100 80 GB o H100 80 GB en paralelo; una sola GPU de 80 GB no es suficiente para pesos completos en BF16.
- ¿Cabe en GPU de consumo? No en BF16. En cuantizaciones agresivas (4 bits) podría aproximarse a los 37 GB, lo que aún excede una RTX 4090 de 24 GB; sería necesario repartir entre varias GPU o usar cuantización más baja no documentada.
- Opciones de despliegue: la model card indica `transformers` con `custom_code` y la librería `LongCat-Next`; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LongCat-Next | 74,26 mil millones (MoE A3B) | no disponible | Texto, visión, audio (any-to-any) | MIT | Pesos en Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (multimodales nativos any-to-any de escala similar) en la documentación proporcionada, por lo que no se puede establecer una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre datos web a gran escala es previsible que herede sesgos, pero el autor no los detalla.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo autorregresivo, puede producir contenido plausible pero incorrecto, especialmente en modalidades menos representadas.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están especificados, lo que impide garantizar cobertura multilingüe o ventanas largas en producción.
- Restricciones de licencia: la licencia MIT es permisiva y permite uso comercial, modificación y redistribución, pero conviene revisar el archivo LICENSE del repositorio para confirmar términos exactos y posibles avisos adicionales sobre los tokenizers.
- Caveats para producción: el modelo requiere `custom_code` y la librería `LongCat-Next`, lo que puede complicar el despliegue en stacks estándar; el tamaño del repositorio (161,2 GB) implica costes de almacenamiento y transferencia considerables; no hay datos publicados de latencia ni throughput.
- Al ser un modelo reciente (creado en marzo de 2026), el ecosistema de herramientas (cuantización, servidores de inferencia) puede ser limitado.

## Enlaces

- Hugging Face: https://huggingface.co/meituan-longcat/LongCat-Next
- Blog: https://longcat.chat/longcat-next/intro
- Demo: https://longcat.chat/longcat-next
- GitHub: https://github.com/meituan-longcat/LongCat-Next
- Paper (arXiv): https://arxiv.org/abs/2603.27538
- Tech report: https://github.com/meituan-longcat/LongCat-Next/blob/main/tech_report.pdf
- Licencia: https://huggingface.co/meituan-longcat/LongCat-Next/blob/main/LICENSE
- Twitter/X: https://x.com/Meituan_LongCat
- Repositorio relacionado (LongCat-Flash-Chat): https://github.com/meituan-longcat/LongCat-Flash-Chat
