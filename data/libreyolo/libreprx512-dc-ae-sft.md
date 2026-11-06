# LibreYOLO/LibrePRX512-dc-ae-sft

## Resumen

LibrePRX512-dc-ae-sft es un espejo (mirror) del modelo de generación de imágenes texto-a-imagen PRX de Photoroom, publicado en el repositorio LibreYOLO. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son idénticos byte a byte a los del repositorio original `Photoroom/prx-512-t2i-dc-ae-sft` y conservan la estructura de pipeline de diffusers, por lo que se pueden cargar directamente con esa librería. El objetivo del espejo es ofrecer acceso al modelo a través del ecosistema LibreYOLO y su API `LibreGen`.

El modelo es un transformer de difusión de 1,3 mil millones de parámetros entrenado desde cero por Photoroom, con un codificador de texto T5Gemma de 2B y el autoencoder DC-AE de factor de compresión 32x. Trabaja a resolución nativa de 512 píxeles y se distribuye como un ajuste fino supervisado (SFT) listo para usar. La relevancia de este lanzamiento radica en que Photoroom ha liberado tanto los pesos como el proceso de entrenamiento bajo licencia Apache-2.0, algo poco habitual en modelos de generación de imágenes de esta escala.

El repositorio ocupa 16,4 GB e incluye los pesos del transformer, el codificador de texto y el VAE en formato safetensors. La ficha siguiente describe las características técnicas del modelo original tal como se documentan en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (text-to-image) con codificador de texto T5Gemma 2B y autoencoder DC-AE 32x |
| Parámetros totales | 1,3B (transformer de difusión); el codificador de texto T5Gemma es de 2B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (pesos PRX); el codificador T5Gemma se rige por los Gemma Terms of Use; el DC-AE es MIT |
| Formato de pesos | safetensors (layout de pipeline diffusers) |

## Arquitectura y entrenamiento

PRX es un transformer de difusión entrenado desde cero por Photoroom para generación texto-a-imagen. La arquitectura combina tres componentes: un transformer de difusión de 1,3B parámetros como generador, un codificador de texto T5Gemma de 2B parámetros que procesa las indicaciones textuales, y el autoencoder DC-AE con factor de compresión 32x procedente de `mit-han-lab/dc-ae-f32c32-sana-1.1-diffusers`, que reduce la resolución latente y permite trabajar a resolución nativa de 512 píxeles. El modelo distribuido en este repositorio es la variante SFT (supervised fine-tune), es decir, un ajuste fino supervisado sobre el modelo base.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card del espejo indica explícitamente que no se ha reentrenado, convertido ni recodificado nada: cada archivo es idéntico al upstream. El blog de anuncio de Photoroom (enlazado más abajo) documenta el proceso de entrenamiento, pero su contenido no forma parte de la información disponible para esta ficha.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) a resolución nativa de 512 píxeles.
- Pipeline compatible con `diffusers`, cargable directamente desde la carpeta del repositorio sin conversión.
- Integración con la librería LibreYOLO mediante la API `LibreGen` y la CLI `libreyolo generate`.
- Uso mediante una sola línea de código en Python: `model("a red fox sleeping in fresh snow").save("fox.png")`.
- Codificador de texto T5Gemma 2B, que aporta comprensión de indicaciones textuales complejas.
- Autoencoder DC-AE de compresión 32x para eficiencia en el espacio latente.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Generación de ilustraciones para prototipado rápido: el modelo produce imágenes a 512 píxeles a partir de una descripción textual, adecuado para maquetas de producto, wireframes visuales y pruebas de concepto antes de encargar arte final.
- Creación de assets para videojuegos y aplicaciones: con 1,3B parámetros en el transformer, el coste de inferencia es contenido y permite generar variaciones de sprites, fondos o iconos en lotes.
- Automatización de contenido para marketing: generación por lotes de imágenes de producto o escenas a partir de plantillas de texto, integrable en pipelines mediante la CLI de LibreYOLO.
- Experimentación en investigación sobre difusión: al ser Apache-2.0 y estar entrenado desde cero, sirve como base para estudiar arquitecturas de difusión, el efecto del DC-AE o el acoplamiento con T5Gemma sin las restricciones de licencias no comerciales.
- Ajuste fino sobre dominio propio: la variante SFT y la licencia permisiva permiten reentrenar o adaptar el modelo a estilos o dominios específicos (moda, inmobiliaria, ilustración infantil) sin obligación de compartir derivados.
- Integración en herramientas de diseño asistido: el pipeline de diffusers permite incrustar el modelo en editores o plugins que generen imágenes de referencia a partir de prompts del usuario.
- Docencia y demostraciones: el tamaño moderado del transformer y la disponibilidad de pesos abiertos facilitan su uso en cursos sobre modelos generativos y difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia orientativa, un transformer de difusión de 1,3B parámetros más un codificador de texto de 2B en precisión fp16 requiere del orden de 6-8 GB de VRAM solo para los pesos, a lo que hay que sumar el VAE y los tensores de activación; esta cifra es una estimación, no un dato publicado.
- GPU recomendadas: no disponibles en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por el tamaño de los pesos es plausible en GPUs con 8-12 GB o más, pero no hay validación publicada en esta ficha.
- Opciones de despliegue: `diffusers` (carga directa del pipeline), librería `libreyolo` con extra `[gen]` (API `LibreGen` y CLI `libreyolo generate`). Otras opciones como vLLM, llama.cpp, Ollama o TGI no aplican a un modelo de difusión de imagen y no se documentan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución nativa | Contexto de texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibrePRX512-dc-ae-sft (PRX) | 1,3B (transformer) + 2B (T5Gemma) | 512 | No disponible | Apache-2.0 (con restricciones Gemma en el codificador) | Hugging Face, diffusers, libreyolo |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de la misma categoría (text-to-image de ~1-2B parámetros entrenados desde cero con licencia permisiva) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Es un espejo, no un modelo nuevo: cualquier actualización o corrección debe buscarse en el repositorio upstream de Photoroom; este repositorio no recibe mantenimiento técnico propio más allá de la réplica.
- Licencia mixta: los pesos PRX son Apache-2.0, pero el codificador de texto T5Gemma está sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy. El uso comercial del conjunto completo debe respetar ambas licencias; no basta con la Apache-2.0.
- El DC-AE procede de `mit-han-lab/dc-ae-f32c32-sana-1.1-diffusers` (MIT); el NOTICE del upstream menciona el VAE de FLUX.1 para cada checkpoint, lo que conviene revisar antes de redistribuir.
- Resolución nativa limitada a 512 píxeles: no se documenta soporte de resoluciones superiores en la información disponible.
- Idiomas soportados no documentados: no se puede garantizar la calidad de las indicaciones en castellano u otros idiomas distintos del inglés sin validación empírica.
- Riesgo de sesgos y alucinaciones visuales: no hay información publicada en esta ficha sobre evaluación de sesgos demográficos, estereotipos o fidelidad de composición; en modelos de difusión es habitual que aparezcan sesgos en la representación de personas y objetos.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento multi-paso; no debe emplearse para tareas de texto.
- Sin benchmarks publicados en la información disponible: no se puede comparar objetivamente su calidad frente a alternativas sin ejecutar evaluaciones propias.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado, lo que reduce la evidencia comunitaria sobre su comportamiento en producción.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/LibreYOLO/LibrePRX512-dc-ae-sft
- Repositorio upstream de Photoroom: https://huggingface.co/Photoroom/prx-512-t2i-dc-ae-sft
- Blog de anuncio de Photoroom: https://huggingface.co/blog/Photoroom/prx-open-source-t2i-model
- Repositorio GitHub de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Documentación de LibreYOLO: https://www.libreyolo.com/docs
- Autoencoder DC-AE (MIT): https://huggingface.co/mit-han-lab/dc-ae-f32c32-sana-1.1-diffusers
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
