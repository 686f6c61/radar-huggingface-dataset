# mradermacher/Qwen3.5-4B-Amadeus-i1-GGUF

## Resumen

Qwen3.5-4B-Amadeus-i1-GGUF es una colección de cuantizaciones en formato GGUF con importancia matrix (imatrix/i1) del modelo Jitheswar/Qwen3.5-4B-Amadeus, un modelo de 4,3 mil millones de parámetros basado en la familia Qwen3.5 de Alibaba. La cuantización ha sido realizada por mradermacher, un cuantizador muy prolífico de la comunidad Hugging Face que se especializa en producir versiones comprimidas de modelos populares para su ejecución en hardware de consumo.

El modelo base es una variante "abliterated" (descensurada) de Qwen3.5-4B, un modelo multimodal (visión + texto) entrenado sobre los datasets mlabonne/harmless_alpaca y mlabonne/harmful_behaviors para eliminar las restricciones de seguridad del modelo original. Esto lo hace relevante para usuarios que necesitan un modelo sin filtros de alineación para investigación, red teaming o casos de uso creativos, aunque conlleva los riesgos éticos obvios.

La relevancia de esta ficha radica en la disponibilidad de más de 20 cuantizaciones distintas, desde IQ1_S (menos de 2 GB) hasta Q6_K (3,7 GB), lo que permite ejecutar el modelo en prácticamente cualquier hardware, desde un portátil modesto hasta una GPU de gama alta, manteniendo un equilibrio ajustable entre tamaño, velocidad y calidad de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), multimodal (texto + vision) |
| Parametros totales | 4.326.350.848 (≈4,33 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q2_K_S, i1-Q2_K_XS (no listado), i1-IQ1_M, i1-IQ1_S, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_S, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_1, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (ademas de imatrix suelto) |
| Idiomas soportados | ingles, chino, multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix/i1); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base, Qwen3.5-4B-Amadeus, deriva de Qwen3.5-4B de Alibaba, un transformer denso de la serie Qwen con capacidades de visión (el repositorio de cuantizaciones estáticas indica que existen archivos mmproj para la parte multimodal). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, composición del dataset preentrenamiento ni procesos de RLHF/DPO del modelo original.

Lo que sí consta es el post-training de la variante Amadeus: se ha aplicado un proceso de "abliteration" (descensurado) sobre el modelo base, y se ha entrenado con los datasets mlabonne/harmless_alpaca y mlabonne/harmful_behaviors, ambos orientados a modificar el comportamiento de seguridad del modelo. Por su parte, mradermacher no modifica los pesos: genera cuantizaciones GGUF ponderadas con matriz de importancia (imatrix), una técnica que calcula estadísticas de activación sobre un corpus de calibración para asignar mayor precisión a los tensores más sensibles a la cuantización, mejorando la calidad frente a las cuantizaciones estáticas equivalentes.

## Capacidades

- Generación de texto conversacional (tag "conversational" en el repositorio).
- Comprensión de imágenes (visión multimodal); los archivos mmproj necesarios están en el repositorio de cuantizaciones estáticas.
- Comportamiento descensurado: responde a solicitudes que el modelo original rechazaría, al haber sido abliterated y afinado con datasets orientados a ello.
- Soporte multilingüe, con énfasis en inglés y chino.
- No consta en la información disponible soporte explícito de tool calling, agentes, thinking mode ni audio.

## Casos de uso

- Ejecución local en hardware modesto: con cuantizaciones de 2,1 a 3,7 GB, el modelo cabe en portátiles sin GPU dedicada o con GPUs de 4-6 GB de VRAM, usando llama.cpp u Ollama.
- Investigación en alineación y seguridad: al ser una variante abliterated, es útil para estudiar el efecto de las técnicas de descensurado y para red teaming de sistemas de moderación.
- Asistente conversacional sin filtros: para chatbots personales donde el usuario quiere evitar los rechazos del modelo original en temas sensibles (ficción, debates controvertidos).
- Descripción y análisis de imágenes en local: gracias a su componente de visión, puede usarse para etiquetado de imágenes o generación de descripciones sin enviar datos a la nube.
- Prototipado rápido de aplicaciones LLM: el pequeño tamaño permite iterar prompts y pipelines en una GPU de consumo antes de escalar a modelos mayores.
- Generación de datos sintéticos sin rechazos: para pipelines de creación de datasets donde los filtros del modelo base interrumpirían la generación.
- Uso offline en entornos sin conectividad: el formato GGUF permite despliegue totalmente local en equipos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde unos 2,3 GB (i1-Q2_K) hasta unos 4 GB (i1-Q6_K), más la memoria necesaria para el contexto y los archivos mmproj si se usa la parte de visión.
- GPU recomendadas: cualquier GPU con 4-6 GB de VRAM es suficiente para las cuantizaciones medias (RTX 3060 de 6 GB, RTX 4060); en GPUs de 8 GB o más (RTX 4070, RTX 4090) sobra memoria y puede usarse contexto amplio. También funciona en CPU pura o en Apple Silicon con memoria unificada.
- Cabe en GPUs de consumo sin problema: es un modelo de 4,3 B de parámetros cuantizado, apto incluso para portátiles.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp, y cualquier runtime compatible con GGUF. No es el formato idóneo para vLLM o TGI, que requieren safetensors (usar en ese caso el modelo base).
- Latencia y throughput: no disponible; al ser un modelo de 4 B, se espera velocidad alta incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Amadeus-i1-GGUF | 4,33 B | GGUF (imatrix) | Sí | apache-2.0 | Descensurado (abliterated), 20+ cuants |
| Qwen3.5-4B (original) | ≈4,3 B | Safetensors/GGUF | Sí | apache-2.0 | Con filtros de seguridad, referencia de calidad |
| Qwen3.5-4B-Amadeus-GGUF (estático) | 4,33 B | GGUF (estático) | Sí | apache-2.0 | Mismo modelo, cuants estáticos sin imatrix del mismo autor |

Como alternativas de la misma categoría de tamaño con comportamiento sin censura, existen otras variantes abliterated de modelos de 4-8 B (por ejemplo, versiones abliterated de Qwen3 o Llama), pero no constan datos comparativos específicos en la información disponible.

## Limitaciones y advertencias

- Al ser un modelo abliterated y afinado con harmful_behaviors, ha perdido parcialmente sus salvaguardas de seguridad: puede generar contenido ofensivo, peligroso o ilegal si se le solicita. Su uso conlleva responsabilidad legal y ética directa del operador.
- La abliteration suele degradar ligeramente la calidad general del modelo (coherencia, razonamiento) respecto al modelo base original.
- El riesgo de alucinación es inherente al modelo base y no se ha mitigado documentadamente; no hay evaluaciones publicadas.
- La longitud de contexto no está especificada en la información disponible; verificarla en la ficha del modelo base antes de depender de contextos largos.
- Las cuantizaciones más agresivas (IQ1_S, IQ2_XXS, Q2_K) pueden producir degradación notable de calidad; el propio autor recomienda IQ3_XXS sobre Q2_K.
- Para usar la capacidad de visión en GGUF hay que descargar los archivos mmproj del repositorio de cuantizaciones estáticas, no de este.
- La licencia apache-2.0 permite uso comercial sin restricciones adicionales, pero el contenido generado sin filtros puede violar términos de servicio de plataformas donde se despliegue.

## Enlaces

- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.5-4B-Amadeus-i1-GGUF
- Repositorio de cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/Qwen3.5-4B-Amadeus-GGUF
- Modelo base: https://huggingface.co/Jitheswar/Qwen3.5-4B-Amadeus
- Modelo original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Página de descargas resumida: https://hf.tst.eu/model#Qwen3.5-4B-Amadeus-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
