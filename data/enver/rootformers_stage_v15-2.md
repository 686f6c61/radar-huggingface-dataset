# enver/rootformers_stage_v15.2

## Resumen

Rootformer Stage 15.2 (`enver/rootformers_stage_v15.2`) es un modelo de traducción árabe-inglés publicado por el usuario `enver`, construido sobre los pesos de Qwen (la model card declara `Qwen/Qwen3.8-27B` como base principal y `Qwen/Qwen3-1.7B` en los metadatos). No es un modelo generalista: está especializado en traducción académica de árabe clásico (kalām, uṣūl al-fiqh, fiqh mālikí, taṣawwuf, manṭiq y balāghah) y en análisis morfológico-sintáctico del árabe no concatenativo, con el inglés como única lengua de destino.

La propuesta técnica central es una decodificación asimétrica: durante el prefill en árabe se ejecutan las 64 capas del modelo base (4-bit NF4 en las pruebas), mientras que durante la decodificación en inglés se eliden K bloques de atención lineal de las capas superiores (K ∈ {4, 8, 12}) y se sustituyen por adaptadores residuales de rango 64 condicionados por un resumen semántico cacheado de las capas 31 y 47. Según el autor, esto produce aceleraciones de 2,48x a 3,32x sobre la línea base autoregresiva con una pérdida mínima de calidad (chrF++ clásico de 60,599 frente a 60,102 en el modo K=4).

Es relevante ahora por dos motivos: primero, aplica decodificación especulativa/elisión de capas a un dominio (traducción de árabe clásico) donde los modelos multilingües genéricos fallan por polisemia teológica; segundo, se distribuye como un paquete de despliegue autónomo (servidor REST, CLI, SDK de Python y una interfaz web) en lugar de como pesos sueltos. El repositorio ocupa 32,3 GB, tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado ningún paper ni evaluación independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención lineal `GatedDeltaNet` (según la model card, heredadas de `Qwen3.8-27B`), con decodificación asimétrica prefill/decode y adaptadores residuales de rango 64 (`HidhaAlAlfazResidualAdapter`) en 24 capas |
| Parametros totales | 27B nominales (modelo base `Qwen/Qwen3.8-27B`); los metadatos también listan `Qwen/Qwen3-1.7B` como base, sin aclarar la relación |
| Parametros activos | no disponible (la model card menciona un componente «6-Pillar GSCA MoE» sin detallar parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit NF4 (única cuantización usada en los benchmarks publicados); no se detallan otras variantes |
| Idiomas soportados | árabe (`ar`) e inglés (`en`) |
| Licencia | apache-2.0 (declarada); los pesos derivados de Qwen quedan sujetos además a la licencia del modelo base |
| Formato de pesos | safetensors (etiqueta de la librería `transformers`) + módulo Triton `causal_conv1d.py` incluido en el repo |

## Arquitectura y entrenamiento

La arquitectura combina un backbone de 64 capas con mecanismos de atención lineal (`GatedDeltaNet`) en los bloques superiores, sobre el que se injertan varios componentes propios: una «Books Mastery Bridge» de 12 slots (escala 0,65) con un MoE de 6 pilares y un módulo de anáfora (*Sabk*), activos durante el prefill; y adaptadores residuales de rango 64 (120 MB en total repartidos en 24 capas) que sustituyen a los bloques elididos durante la decodificación. La cabeza de salida (`SibawayhSlicedLMHead`) conserva 148.891 tokens (árabe e inglés) y poda 99.429 tokens CJK no utilizados, lo que según el autor ahorra 1,95 GB de VRAM sin divergencia de logits (0,000000 declarado).

En el plano lingüístico, el modelo incorpora una factorización morfológica no concatenativa explícita — φ(w) = (raíz, patrón, proclítico, enclítico) — apoyada en una tabla de búsqueda de 329.695 entradas derivada de la tradición de al-Khalīl ibn Aḥmad al-Farāhīdī, con 10.899 raíces trilíteras/cuadrilíteras y 160 plantillas morfológicas (*awzān*), más un fallback algorítmico. Sobre eso se añade un autómata de rección sintáctica (*ʿAmal*) de 16 estados inspirado en Sībawayh, que rastrea transiciones entre *Ibtidāʾ*, *Khabar*, *Fāʿil*, *Mafʿūl bihi*, *Nāʾib al-Fāʿil*, *Iḍāfah* y *ʿAṭf*.

No se publican datos sobre el corpus de entrenamiento: no hay número de tokens, composición del dataset, ni mención a RLHF, DPO o SFT. Tampoco se documenta si los componentes lingüísticos son módulos deterministas en tiempo de inferencia o artefactos aprendidos. La model card no incluye ninguna innovación verificada más allá de la elisión de capas en decodificación y el kernel Triton `causal_conv1d` para las capas `GatedDeltaNet`.

## Capacidades

- Traducción de árabe clásico a inglés en dominios especializados: kalām, uṣūl al-fiqh, fiqh mālikí, taṣawwuf, manṭiq y balāghah, con anclas terminológicas emitidas en grafía árabe original en lugar de transliteración latina.
- Traducción de árabe estándar moderno (MSA): 92,090 chrF++ y 81,85 BLEU en el conjunto interno MSA-12 reportado por el autor.
- Desambiguación de participio activo frente a pasivo en homógrafos no vocalizados (`محدث`, `مؤثر`, `مرجح`): 25/25 aciertos declarados.
- Reconocimiento de voz pasiva (*al-Mabnī lil-Majhūl*) y asignación de *Nāʾib al-Fāʿil*.
- Análisis morfológico: descomposición en raíz, patrón y clíticos con latencia O(1) sobre la tabla Farāhīdī.
- Resolución de anáfora pronominal entre límites de cláusula (*Sabk*) para enclíticos `ـه`, `ـها`, `ـهم`: 8/8 cadenas multiclausales declaradas.
- Control de deriva polisémica: 0,00 % de filtraciones declaradas en términos clásicos polisémicos (`العالم`, `الدور`, `الشارع`, `الفاعل`, `الحال`, `العين`, `القدر`, `المحل`).
- Cuatro modos de decodificación conmutables por línea de comandos (`--ultra-fidelity` K=4, `--27b` K=8 por defecto, `--turbo` K=12) que intercambian latencia por fidelidad.
- Interfaces de servicio: API REST con JSON, CLI, SDK de Python y una interfaz web («Widescreen Desktop & Mobile Sovereign Workbench UI»).
- Tool calling / function calling: no disponible.
- Capacidades de agente multi-paso: no disponible.
- Visión o audio: no disponibles.

## Casos de uso

- Traducción editorial de tratados de kalām y uṣūl al-fiqh: el modelo está entrenado para mantener terminología técnica estable (`(الصانع)`, `(حادث)`, `(ترجيح بلا مرجح)`) y evitar la deriva hacia acepciones modernas, lo que reduce la carga de revisión en traducciones académicas de obras como *Dalāʾil al-Iʿjāz*.
- Edición crítica y digitalización de manuscritos: la desambiguación automática de participios activo/pasivo en texto no vocalizado resuelve uno de los principales cuellos de botella manuales en la catalogación de corpus clásicos.
- Anotación morfológica y sintáctica de corpus árabes: la factorización en raíz, patrón y clíticos, junto con el autómata de rección de 16 estados, permite generar anotaciones estructuradas (no solo texto traducido) para proyectos de lingüística computacional semítica.
- Traducción de documentación religiosa y jurídica contemporánea: con 92,090 chrF++ en MSA-12, cubre textos administrativos y divulgativos en árabe estándar moderno dirigidos a audiencias anglófonas.
- Servicio on-premise con requisitos de confidencialidad: el paquete se instala con `./install.sh && ./run_standalone_server.sh` en un servidor Linux propio, sin dependencia de APIs externas, lo que encaja en instituciones que no pueden enviar manuscritos a la nube.
- Alineación de traducciones a nivel de pronombre: la resolución de anáfora (*Sabk*) permite verificar que los pronombres enclíticos del texto árabe se mapean al antecedente correcto en inglés, útil en control de calidad de traducciones paralelas.
- Integración en pipelines de publicación: la API REST y el SDK de Python permiten encadenar traducción, revisión humana y maquetación en un flujo automatizado, con el modo `--turbo` para borradores y `--ultra-fidelity` para la versión final.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre `Qwen3.8-27B` en 4-bit NF4 con una NVIDIA A40, evaluando 10 pasajes «gold» clásicos y el conjunto interno MSA-12:

| Modo de decodificacion | Profundidad activa en decodificacion | Velocidad media (tok/s) | Velocidad pico (tok/s) | Palabras/s | Tiempo total (10 pasajes) | Aceleracion | chrF++ clasico gold | BLEU clasico gold | chrF++ MSA-12 |
|---|---|---|---|---|---|---|---|---|---|
| Autoregresivo puro (K=0) | 64L / 64L | 11,03 | 11,24 | 8,59 | 124,03 s | 1,00x | 60,102 | 32,52 | 92,090 |
| Ultra-fidelidad (K=4) | 64L prefill / 60L decode | 28,82 | 52,87 | 22,49 | 50,02 s | 2,48x | 60,599 | 33,67 | 92,090 |
| Equilibrado por defecto (K=8) | 64L prefill / 56L decode | 30,36 | 38,61 | 23,53 | 43,77 s | 2,83x | 59,734 | 32,86 | 92,090 (81,85 BLEU) |
| Turbo (K=12) | 64L prefill / 52L decode | 34,57 | 49,50 | 26,90 | 37,32 s | 3,32x | 58,822 | 33,39 | 92,090 |

Precisión declarada en tareas lingüísticas internas: 100 % en desambiguación de participio (25/25), 100 % en voz pasiva, 100 % en anáfora (8/8) y 0,00 % de filtraciones de polisemia moderna. No hay resultados en MMLU, HumanEval, GSM8K ni en ningún benchmark estándar de traducción (WMT, Flores-200), ni evaluación de terceros.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como referencia, 27B parámetros en 4-bit NF4 implican del orden de 13-14 GB solo en pesos, a los que hay que sumar la caché KV y los adaptadores (120 MB); el ahorro declarado por la poda de tokens CJK es de 1,95 GB.
- GPU validada: NVIDIA A40 (48 GB) con cuantización 4-bit NF4, única configuración con métricas publicadas.
- GPU consumer: no confirmado. Por tamaño de pesos, una GPU de 24 GB (RTX 4090, RTX 3090) sería el mínimo teórico en 4-bit, pero el autor no aporta ninguna medición en consumer.
- Despliegue: scripts propios `install.sh` y `run_standalone_server.sh` (servidor autónomo con UI, API REST, CLI y SDK de Python); kernel Triton `causal_conv1d.py` incluido para las capas `GatedDeltaNet`, sin necesidad de compilar extensiones C++.
- vLLM, llama.cpp, Ollama o TGI: no disponible; la model card no menciona compatibilidad con estos motores.
- Latencia y throughput: 28,82-34,57 tok/s de media y hasta 52,87 tok/s de pico en A40 según el modo; 37,32-50,02 s para 10 pasajes clásicos frente a 124,03 s en la línea base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rootformer Stage 15.2 | 27B (base Qwen3.8-27B) | no disponible | Traducción ar→en clásica + morfología y sintaxis | apache-2.0 | Repo HF, 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | LLM generalista multilingüe | no disponible en la informacion | Consultado como base del anterior |
| Qwen/Qwen3-1.7B (base declarada) | 1,7B | no disponible | LLM generalista ligero | no disponible en la informacion | Consultado como base del anterior |
| Otros traductores ar→en especializados | no disponible | no disponible | — | — | No se han identificado alternativas comparables en la informacion disponible |

No se dispone de datos verificables de modelos comparables de traducción árabe clásico-inglés en la información proporcionada; la comparación con los dos modelos base se limita a lo declarado en los metadatos del repositorio.

## Limitaciones y advertencias

- Ausencia total de validación independiente: 0 descargas y 0 likes, sin paper, sin repositorio de evaluación y sin resultados en benchmarks estándar (WMT, Flores-200) que permitan contrastar las cifras declaradas.
- Los benchmarks se han medido sobre 10 pasajes «gold» seleccionados por el propio autor y sobre un conjunto interno (MSA-12) no publicado; el tamaño muestral es demasiado pequeño para extraer conclusiones robustas.
- Inconsistencia en los metadatos: `base_model` lista simultáneamente `Qwen/Qwen3.8-27B` y `Qwen/Qwen3-1.7B`, y las etiquetas incluyen `base_model:finetune:Qwen/Qwen3-1.7B`. No queda claro qué pesos contienen realmente los safetensors del repo de 32,3 GB.
- No se documenta el entrenamiento: ni tokens, ni composición del corpus, ni método de alineación (RLHF/DPO/SFT). Es imposible evaluar la procedencia de las capacidades declaradas.
- La elisión de capas en decodificación (K=4 a K=12) degrada la calidad de forma medible en los propios datos del autor: chrF++ clásico baja de 60,599 (K=4) a 58,822 (K=12). El comportamiento fuera del dominio clásico con K alto no está evaluado.
- Riesgo de alucinación alto en un dominio de altísima sensibilidad: traducciones teológicas y jurídicas erróneas pueden tener consecuencias legales o doctrinales; se requiere revisión por especialista en cualquier uso editorial.
- Cobertura lingüística restringida a árabe e inglés; no hay soporte de castellano ni de otras lenguas, ni evaluación de calidad en registro coloquial o dialectal.
- Idiomaticidad y terminología: la model card prescribe el uso de anclas en grafía árabe original, lo que puede no encajar con las convenciones editoriales de la publicación de destino.
- Licencia: apache-2.0 es permisiva, pero al derivar de pesos Qwen la licencia efectiva del modelo base puede imponer condiciones adicionales; conviene verificar los términos de Qwen antes de un uso comercial.
- El repositorio incluye código ejecutable (scripts de instalación, servidor y kernel Triton); ejecutarlo implica confiar en código de un autor sin historial verificable.
- Terminología idiosincrásica y mezcla de marcos teológicos con ingeniería en la documentación, lo que dificulta la replicación técnica de los componentes descritos.
- Fecha de creación registrada: 2026-10-25, posterior a la fecha habitual de consulta; conviene verificar la vigencia y el estado real del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/enver/rootformers_stage_v15.2
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base declarado (metadatos): https://huggingface.co/Qwen/Qwen3-1.7B
- Paper, blog, repositorio de código o demo: no disponible (la búsqueda web no devolvió resultados relacionados con el modelo; los únicos resultados fueron páginas biográficas sobre Enver Pasha y Enver Hoxha, sin relación alguna con este repositorio).
