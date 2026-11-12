# MediaAtlas/sraka-27b-v3-razpisi-lora

## Resumen

Sraka 27B v3 · bralec razpisne dokumentacije (LoRA) es un adaptador de bajo rango (LoRA) publicado por MediaAtlas sobre su modelo base MediaAtlas/sraka-27b-v3, que a su vez deriva de Qwen3.8-27B según declara el autor. El adaptador está especializado en una tarea muy concreta: leer documentación de licitaciones públicas eslovenas y devolver un JSON estructurado con los requisitos del pliego (objeto del contrato, valor estimado, referencias, facturación mínima, certificados, personal, seguros, criterios de adjudicación, oferta conjunta, subcontratistas y condiciones de exclusión), acompañando cada campo no vacío con una cita literal del texto (`dokaz`).

El modelo resuelve un problema de extracción de información con trazabilidad: no basta con rellenar campos, sino que cada valor debe poder anclarse a un fragmento textual verificable. Está pensado como lector de respaldo dentro de Razpisnik (tenders.mediaatlas.si), la plataforma de MediaAtlas, para cubrir los casos en que el lector principal (Claude) no responde.

Los pesos del adaptador ocupan unos 0,9 GB y se distribuyen bajo licencia Apache-2.0, heredando las condiciones del modelo base. El entrenamiento se hizo con LLaMA-Factory sobre 236 pares instrucción-respuesta, con LoRA de rango 32 en todas las capas del decodificador, y una ventana de entrada de aproximadamente 16.000 tokens según la documentación del autor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.8-27B según el autor); adaptador LoRA sobre todas las capas del bloque lingüístico |
| Parametros totales | 27B en el modelo base; el adaptador LoRA no declara recuento propio (r=32, repo de 0,9 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ~16.000 tokens de entrada por extracto documental (según la model card); contexto nativo del base no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se sirve en bf16 según la medición del autor; el base admite las cuantizaciones que soporte el runtime) |
| Idiomas soportados | esloveno (sl) |
| Licencia | Apache-2.0 (adaptador y base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el base por separado |

## Arquitectura y entrenamiento

El adaptador se monta sobre un transformer decoder-only de 27B parámetros (Qwen3.8-27B, Apache-2.0, según declara el autor). El ajuste es un LoRA de rango 32 aplicado a todas las capas del bloque lingüístico, entrenado con LLaMA-Factory usando la plantilla de chat `qwen3_8` en modo sin razonamiento (sin *thinking*). Se realizaron 2 épocas sobre 236 pares de instrucción con extracto documental y respuesta JSON.

Los datos de entrenamiento provienen de documentación pública de licitaciones del portal esloveno de contratación pública, leída por Razpisnik en noviembre de 2026, con correos, teléfonos y líneas de contacto recortados. Las respuestas objetivo son lecturas generadas por Claude (Anthropic, Sonnet vía `claude -p`) que el equipo usa en producción; solo se conservaron aquellas en las que todas las citas estaban literalmente presentes en el texto. El par de instrucción es el mismo que recibe el lector principal (`tenders/extract_claude.py`, `PROMPT`): esquema de campos más extracto de hasta ~16.000 tokens, con salida JSON pura. Los pares de entrenamiento no se han publicado.

## Capacidades

- Extracción de información estructurada de documentación de licitaciones públicas en esloveno, con salida JSON conforme a un esquema fijo.
- Anclaje de cada campo no vacío a una cita literal del texto (`dokaz`), lo que permite verificación posterior.
- Cobertura de campos específicos del dominio: objeto del contrato, valor estimado, referencias, facturación mínima, certificados, personal, seguros, criterios de adjudicación, oferta conjunta, subcontratistas y condiciones de exclusión.
- Procesamiento de extractos documentales largos (hasta ~16.000 tokens) en una sola pasada.
- Modo sin razonamiento (no *thinking*), orientado a latencia y a salida JSON directa.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni multilingüismo más allá del esloveno.

## Casos de uso

- **Extracción automática de pliegos en plataformas de licitación**: el adaptador lee el extracto del pliego y devuelve el JSON con los campos del esquema, lo que permite indexar y comparar licitaciones de forma estructurada. Es adecuado porque el esquema y el formato de salida están fijados por el prompt de entrenamiento.
- **Lector de respaldo en producción**: en Razpisnik se usa como *fallback* cuando el lector principal (Claude) no responde, manteniendo el mismo contrato de salida JSON y el mismo prompt, lo que simplifica el enrutado.
- **Verificación de citas y control de calidad**: como cada campo lleva una cita literal, un pipeline posterior puede comprobar que el fragmento existe en el documento y descartar o marcar las extracciones no ancladas. El autor reporta un 99,2 % de citas verificables en su conjunto de evaluación.
- **Alertas tempranas de requisitos de solvencia**: extraer facturación mínima, certificados y seguros permite generar avisos automáticos a licitadores sobre si cumplen los umbrales antes de preparar la oferta.
- **Análisis de criterios de adjudicación**: los criterios y su ponderación pueden extraerse y agregarse para estudiar cómo se puntúa en distintos organismos compradores.
- **Detección de subcontratación y ofertas conjuntas**: los campos de subcontratistas y oferta conjunta permiten construir grafos de colaboración entre empresas a partir de los pliegos.
- **Enriquecimiento de bases de datos de contratación pública**: los JSON extraídos pueden alimentar un almacén analítico para estudiar valores estimados, plazos y condiciones por sector.

## Benchmarks y rendimiento

El autor publica una evaluación propia sobre 100 lecturas reservadas (98 con datos utilizables), revisadas manualmente (69 sin observaciones, 29 con observaciones menores, 2 incorrectas), midiendo cuántas de las citas indicadas aparecen literalmente en el texto frente al número de citas de Claude en las mismas licitaciones.

| Lector | Licitaciones | Citas confirmadas | Claude | Proporción sobre Claude | Citas que aparecen en el texto | Sin JSON válido |
|---|---|---|---|---|---|---|
| Sraka 27B v3 con adaptador | 98 | 486 | 579 | 83,9 % | 99,2 % | 9 |
| Sraka 27B v3 sin adaptador | 98 | 344 | 579 | 59,4 % | 72,7 % | 12 |

Medición realizada sirviendo el modelo fusionado en bf16 con vLLM. El propio autor advierte que una cita presente en el texto demuestra que el fragmento no fue inventado, pero no que el valor extraído sea correcto o coincida con el de Claude. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el adaptador se sirve fusionado con el base de 27B en bf16, lo que requiere del orden de 54 GB solo para pesos, más caché KV y overhead del runtime; con cuantización de 8 bits bajaría a ~27 GB y con 4 bits a ~14-16 GB, aunque el autor no documenta estas configuraciones.
- **GPU recomendadas**: A100 80 GB, H100 80 GB o H200 para bf16 sin compromisos; L40S 48 GB o A6000 48 GB pueden quedarse justas en bf16 y requerir cuantización.
- **Consumer GPU**: no cabe en bf16 en GPU de consumo; en 4 bits podría intentarse en RTX 4090 24 GB o RTX 3090 24 GB, pero no está validado por el autor.
- **Opciones de despliegue**: vLLM (configuración usada por el autor), además de TGI, llama.cpp u Ollama si se convierte el modelo fusionado a GGUF; el adaptador PEFT requiere cargar el base y aplicar el LoRA o fusionarlo previamente.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sraka 27B v3 con adaptador (este) | 27B (LoRA r=32) | ~16.000 tokens de entrada | Extracción JSON de pliegos eslovenos con citas | Apache-2.0 | Hugging Face (adaptador; base aparte) |
| Sraka 27B v3 sin adaptador | 27B | no disponible | Modelo base generalista | Apache-2.0 | Hugging Face |
| Claude Sonnet (referencia del autor) | no disponible | no disponible | Extracción de pliegos con citas | Propietaria | API de Anthropic |

No se dispone de datos públicos de otros adaptadores especializados en licitaciones eslovenas para una comparación cuantitativa adicional.

## Limitaciones y advertencias

- **Dominio estrecho**: entrenado con 236 ejemplos de un solo mes de licitaciones; el autor reconoce que lee peor otras tipologías documentales.
- **Sin autoverificación**: el modelo no comprueba sus propias citas; en producción debe ir acompañado de un verificador de citas como el de Razpisnik.
- **Riesgo de alucinación en valores**: aunque las citas sean literales, el valor derivado puede no coincidir con el correcto; la métrica del autor mide anclaje textual, no exactitud semántica.
- **Idioma único**: solo esloveno; no se ha validado en castellano ni en otros idiomas.
- **Dependencia del base**: el adaptador no funciona sin MediaAtlas/sraka-27b-v3, y los pesos del base no se incluyen en este repositorio.
- **Salida JSON no siempre válida**: en la evaluación del autor, 9 de 98 lecturas no produjeron JSON válido, lo que exige manejo de errores y reintentos en producción.
- **No es asesoramiento jurídico**: el texto oficial es siempre la documentación original de la licitación.
- **Licencia**: Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base; conviene revisar la model card del base antes de desplegar.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/MediaAtlas/sraka-27b-v3-razpisi-lora
- Modelo base: https://huggingface.co/MediaAtlas/sraka-27b-v3
- Plataforma Razpisnik (MediaAtlas): https://tenders.mediaatlas.si
- Portal esloveno de contratación pública (fuente de los textos): https://www.enarocanje.si (portal «Javne informacije Slovenije – portal javnih naročil»)
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- vLLM (runtime de servicio): https://github.com/vllm-project/vllm
