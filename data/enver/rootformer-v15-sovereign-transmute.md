# enver/rootformer-v15-sovereign-transmute

## Resumen

Rootformer-v15-Sovereign-Transmute es un modelo de generación de texto de 399.371.824 parámetros (aproximadamente 0,4B) desarrollado por el autor «enver», adscrito a AynEngine y a la University of Prishtina. Se presenta como un motor de «transmutación» bidireccional árabe clásico-inglés basado en una arquitectura no concatenativa: no emplea tokenización BPE, sino una representación morfémica que reconstruye raíces trilíteras antes de la codificación. El problema que aborda es la fragmentación que el BPE estadístico provoca en el árabe clásico y los errores de polaridad semántica que se derivan de ella en textos filosóficos y teológicos.

La model card describe dos innovaciones principales: el «Al-Khalīl Algebraic Phonological Engine», un motor de pelado de prefijos (الـ, والـ, فالـ, بالـ, للـ) y reconstrucción fonológica que trata fenómenos de Iʿlāl e Ibdāl, y el «Neuro-Semantic Latent Router», un mecanismo de gating por atención que utiliza los estados ocultos de la capa 14 de un transformer de 24 capas para desambiguar registros semánticos (centroides SCHOLASTIC frente a BEDOUIN) en un espacio de embedding de 896 dimensiones.

El backbone declarado es Qwen2.5-0.5B. El modelo está etiquetado con `custom_code`, por lo que requiere `trust_remote_code=True`, y su licencia es una licencia académica personalizada. El repositorio registra 0 descargas y 0 «likes» en el momento de la consulta, y no se han publicado resultados de benchmarks ni detalles del corpus de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder con backbone Qwen2.5-0.5B (24 capas), denominado «Ishtiqāq Transformer»; tokenización morfémica sin BPE y enrutador latente neuro-semántico |
| Parámetros totales | 399.371.824 (≈0,4B), dato de safetensors |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones oficiales ni GGUF) |
| Idiomas soportados | árabe (clásico) e inglés (ar, en) |
| Licencia | aynengine-uni-prishtina-academic (licencia personalizada, etiquetada como `other`) |
| Formato de pesos | safetensors (tamaño de repositorio 0,8 GB); requiere `custom_code` |

## Arquitectura y entrenamiento

La arquitectura combina un decoder transformer convencional con dos componentes propietarios. El primero es el Al-Khalīl Algebraic Phonological Engine, que opera antes del modelo: aplica un pelado idempotente de prefijos y reconstruye la raíz trilítera (por ejemplo, المِيزَانُ → √و-ز-ن y المِيعَادُ → √و-ع-د), resolviendo mutaciones de radical débil (Iʿlāl bi-l-Qalb) y asimilaciones dentales/semivocálicas (Ibdāl en la forma VIII) sin recurrir a un diccionario externo. El segundo es el Neuro-Semantic Latent Router, descrito como un gating de atención continuo que extrae el tensor oculto H^(14) ∈ ℝ^(seq_len × 896) de la capa 14 del transformer y calcula un vector de contexto mezclado h_ctx = Norm(0,7·h_t + 0,3·h_s), que proyecta sobre centroides normalizados (SCHOLASTIC y BEDOUIN) mediante similitud coseno por producto escalar. El objetivo declarado es evitar la «Bedouin Etymological Trap» sin búsquedas de frases codificadas.

En cuanto al entrenamiento, la información disponible no especifica el número de tokens, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste por instrucciones. La model card proporcionada aparece truncada en la descripción del cálculo del router, por lo que no se detallan hiperparámetros, régimen de entrenamiento ni innovaciones de decodificación (por ejemplo, decodificación especulativa). No se documenta atención lineal ni arquitecturas de estado recurrente.

## Capacidades

- Generación de texto y traducción/«transmutación» bidireccional entre árabe clásico e inglés.
- Tokenización morfémica sin BPE (zero-BPE) con extracción de raíces trilíteras según el esquema atribuido a Al-Farāhīdī.
- Desambiguación de polaridad semántica en términos con raíces compartidas (caso declarado: قِسْط «equidad» frente a قَسَطَ «injusticia»).
- Tratamiento de terminología filosófica y teológica (falsafa aviceniana, kalām, usul al-fiqh), incluida la modalidad aviceniana del tipo «واجب الوجود».
- Gestión de estructuras morfosintácticas como la iḍāfah teológica (وَعْدُ الله).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline declarado es text-generation.
- Modo «thinking» explícito: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a los dos idiomas declarados (ar, en); no se documentan otras lenguas.

## Casos de uso

- Traducción académica de tratados árabes clásicos: el modelo está diseñado específicamente para preservar la terminología de kalām, falsafa y usul al-fiqh, evitando los errores de polaridad que la model card atribuye a los LLM basados en BPE en pares como قِسْط/قَسَطَ.
- Anotación morfológica de corpus y manuscritos: el motor Al-Khalīl devuelve raíces trilíteras normalizadas (√و-ز-ن, √و-ع-د), lo que permite generar capas de lematización y análisis de raíz para pipelines de humanidades digitales.
- Preprocesamiento para buscadores y sistemas de recuperación en árabe clásico: la representación por raíz reduce la variabilidad superficial de las palabras y mejora la coincidencia entre consultas y pasajes en corpus teológicos.
- Asistencia a investigadores en estudios islámicos: mediante el endpoint de chat declarado (`POST https://wyresup.com/api/rootformer/chat`), se puede consultar terminología y estructuras sintácticas concretas sin salir del entorno de investigación.
- Enseñanza del árabe clásico: análisis de prefijos, formas verbales derivadas e iḍāfah para estudiantes, con explicación de la raíz subyacente de cada forma.
- Evaluación comparativa de tokenizadores: sirve como referencia académica para medir el impacto de la tokenización morfémica frente al BPE en tareas de árabe clásico, siempre que se acompañe de una evaluación propia, dado que el autor no publica métricas.
- Generación controlada de glosas interlineales: para edición crítica o traducción asistida de pasajes cortos, revisando siempre el resultado por tratarse de un modelo pequeño (≈0,4B).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye ejemplos cualitativos de «transmutación», que se reproducen a continuación exclusivamente como ilustración de las afirmaciones del autor y no como métricas evaluadas.

| Entrada en árabe clásico | Salida declarada por el autor | Raíces farāhīdíes indicadas |
|---|---|---|
| المِيزَانُ يَعْدِلُ بَيْنَ الأَشْيَاءِ بِالقِسْطِ | «The scale balances between things with equity.» | وزن → عدل → بين → شيء → قسط |
| المِيعَادُ حَقٌّ وَوَعْدُ اللهِ لَا يُخْلَفُ | «The appointed time is true, and God's promise is not broken.» | وعد → حقق → الله → لا → خلف |
| واجب الوجود لا يمكن عدمه | «The Necessary Existent cannot be non-existent.» | وجب → وجد → لا → مكن → عدم |
| الِاتِّحَادُ بَيْنَ الجَوْهَرَيْنِ مُمْتَنِعٌ فِي العَقْلِ | «Union between two substances is impossible in the intellect.» | وحد → بين → جهر → منع → في → عقل |
| الِاتِّصَالُ نَقِيضُ الِانْفِصَالِ فِي المِقْدَارِ | «Continuity is the contradictory of discreteness in magnitude.» | وصل → نقض → فصل → في → قدر |

## Requisitos de hardware

- VRAM estimada en precisión de 16 bits (bf16/fp16): en torno a 0,8 GB solo para pesos, coherente con el tamaño de repositorio declarado de 0,8 GB; a ello hay que sumar activaciones y caché KV, no cuantificados en la información disponible.
- VRAM estimada en int8: aproximadamente 0,4 GB para pesos (estimación aritmética a partir del número de parámetros, no verificada con ficheros publicados).
- VRAM estimada en int4: aproximadamente 0,2 GB para pesos (misma salvedad).
- GPU recomendadas: no disponible. Por tamaño, el modelo es holgadamente compatible con cualquier GPU de consumo con al menos 2-4 GB de VRAM libre, pero no se documenta compatibilidad ni optimizaciones específicas.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con unos pocos GB de VRAM, dado el recuento de parámetros; no confirmado por el autor.
- Opciones de despliegue: el tag `custom_code` implica el uso de `trust_remote_code=True` con la librería transformers. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y estos runtimes pueden requerir modificaciones para soportar una arquitectura personalizada sin kernels precompilados. El autor ofrece además una API de producción propia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rootformer-v15-Sovereign-Transmute | 399,4 M | no disponible | ar, en | aynengine-uni-prishtina-academic | HuggingFace (0 descargas), API propia |
| Qwen2.5-0.5B (backbone declarado en la model card) | ~0,5B según su denominación | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | HuggingFace |
| Otras alternativas de traducción árabe clásico-inglés | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada otros modelos de la misma categoría (tokenización morfémica árabe sin BPE) con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No se han publicado benchmarks, evaluaciones independientes ni métricas objetivas; todas las capacidades descritas proceden de la propia model card del autor.
- El repositorio registra 0 descargas y 0 «likes», por lo que no existe validación por parte de la comunidad.
- La licencia `aynengine-uni-prishtina-academic` se etiqueta como `other`; no se detallan en la información disponible los términos exactos de uso comercial, por lo que se debe consultar el fichero LICENSE antes de cualquier despliegue productivo.
- El modelo requiere `custom_code` y `trust_remote_code=True`, lo que implica ejecutar código del autor y limita la portabilidad a runtimes estándar.
- Los idiomas soportados se restringen a árabe clásico e inglés; no hay soporte documentado de otras lenguas ni de árabe dialectal moderno.
- Con 399,4 M de parámetros, la capacidad de generación libre es limitada; es previsible un mayor riesgo de alucinación en textos largos o dominios no cubiertos, aunque no se han publicado tasas de error.
- La model card proporcionada está truncada (se interrumpe en la descripción del router), por lo que faltan detalles de entrenamiento, datos, hiperparámetros y condiciones de uso.
- No se documentan sesgos conocidos, pero el corpus de entrenamiento es desconocido, lo que impide evaluar sesgos religiosos, históricos o culturales.
- La fecha de creación indicada en el repositorio (2026-09-28) es posterior a la fecha habitual de consulta y resulta anómala; conviene verificarla antes de citarla.
- Los términos «soberano», «transmutación» y las referencias a Al-Farāhīdī o Avicena son nomenclatura del autor; no implican validación académica independiente.
- La longitud de contexto no está documentada, lo que impide planificar tareas que dependan de ventanas largas.

## Enlaces

- HuggingFace: https://huggingface.co/enver/rootformer-v15-sovereign-transmute
- HUD académico del autor: https://wyresup.com/aynengine/
- API de producción declarada: `POST https://wyresup.com/api/rootformer/chat`
- Licencia: fichero `LICENSE` referenciado en el repositorio como `license_link: LICENSE`
- Papers, repositorios independientes o demos adicionales: no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
