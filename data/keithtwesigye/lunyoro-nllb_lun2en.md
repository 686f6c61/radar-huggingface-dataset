# keithtwesigye/lunyoro-nllb_lun2en

## Resumen

El modelo `keithtwesigye/lunyoro-nllb_lun2en` es un fine-tune del modelo NLLB-200 distilled 600M de Meta, especializado en la traducción automática de Lunyoro/Rutooro (lengua bantú hablada en los reinos Bunyoro-Kitara y Tooro del oeste de Uganda) al inglés. Fue desarrollado por Keith Twesigye y forma parte de un ecosistema de modelos de traducción para esta lengua de bajos recursos, junto con variantes MarianMT y la dirección inversa inglés→Lunyoro.

El modelo resuelve un problema crítico de accesibilidad lingüística: la falta de sistemas de traducción de calidad para lenguas africanas minoritarias. Al partir de NLLB-200, que ya cubre 200 lenguas, el fine-tune con datos paralelos específicos mejora la precisión en el par Lunyoro→Inglés. Con 615 millones de parámetros y una arquitectura transformer encoder-decoder, es un modelo compacto que puede ejecutarse en hardware de consumo.

La relevancia actual radica en el creciente interés por la preservación digital de lenguas en peligro y la democratización de la IA para comunidades lingüísticas subrepresentadas. El modelo se distribuye bajo licencia MIT, lo que facilita su adopción comercial y académica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) basada en NLLB-200 distilled 600M |
| Parametros totales | 615.073.792 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (limitada por el tokenizador NLLB, típicamente 1024 tokens) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, sin cuantizaciones oficiales) |
| Idiomas soportados | Lunyoro/Rutooro (código `run_Latn`) e inglés (código `eng_Latn`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `facebook/nllb-200-distilled-600M`, una versión destilada del NLLB-200 de 54B parámetros. NLLB-200 emplea una arquitectura transformer estándar con atención de múltiples cabezas, normalización previa y embeddings compartidos entre encoder y decoder. La versión destilada reduce el tamaño manteniendo un rendimiento competitivo mediante destilación de conocimiento desde el modelo grande.

El fine-tune se realizó sobre aproximadamente 53.948 pares de oraciones inglés-Lunyoro, compilados de fuentes colaborativas, entradas de diccionario Runyoro-Rutooro, corpus paralelos y aumentación con back-translation, con filtrado de calidad. Se entrenó durante 10 épocas con el optimizador AdamW y un programa de tasa de aprendizaje con decaimiento coseno, en GPU NVIDIA con CUDA. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado estándar para traducción.

## Capacidades

- Traducción automática neuronal de Lunyoro/Rutooro a inglés, con soporte para textos de hasta 256 tokens de salida (configuración por defecto en el ejemplo de uso).
- Manejo de vocabulario específico de la lengua, incluyendo dialectos Lunyoro y Rutooro, gracias al fine-tune con datos locales.
- Integración con el ecosistema Hugging Face Transformers mediante `NllbTokenizer` y `AutoModelForSeq2SeqLM`.
- Generación con búsqueda de haces (beam search) de 4 haces, lo que mejora la calidad de las traducciones.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otras funciones más allá de la traducción.

## Casos de uso

- Traducción de documentos oficiales y administrativos: el modelo puede convertir actas, formularios y comunicados del gobierno ugandés escritos en Lunyoro al inglés, facilitando el acceso a servicios públicos.
- Preservación lingüística digital: permite digitalizar y traducir literatura oral, proverbios y textos culturales en Lunyoro, contribuyendo a archivos digitales accesibles internacionalmente.
- Educación bilingüe: en escuelas de la región de Bunyoro y Tooro, el modelo puede generar materiales didácticos en inglés a partir de contenido local, o viceversa, apoyando la enseñanza de ambas lenguas.
- Atención al cliente en sectores rurales: empresas de telecomunicaciones o banca móvil pueden integrar el modelo en chatbots para traducir consultas de usuarios que escriben en Lunyoro, mejorando la experiencia de servicio.
- Investigación lingüística: lingüistas y antropólogos pueden usar el modelo para transcribir y traducir entrevistas de campo, acelerando el análisis de datos cualitativos.
- Traducción de contenido web: comunidades ugandesas pueden traducir páginas web o publicaciones en redes sociales del inglés al Lunyoro, aumentando la presencia digital de la lengua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como BLEU, chrF o comparaciones con otros sistemas. Se recomienda evaluar el modelo en un conjunto de validación propio antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 615M parámetros. En precisión fp32, los pesos ocupan aproximadamente 2,5 GB; en fp16, unos 1,2 GB. Con el tokenizador y buffers, se recomienda al menos 4 GB de VRAM para fp16 y 6 GB para fp32.
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM, como NVIDIA GTX 1660, RTX 2060, RTX 3060, RTX 4060, o superiores. También funciona en CPU con llama.cpp o transformers, aunque con mayor latencia.
- Despliegue: compatible con Hugging Face Transformers, vLLM (para inferencia optimizada), y puede convertirse a GGUF para ejecución en CPU con llama.cpp u Ollama.
- Latencia estimada: en una GPU RTX 3060, una traducción de una frase corta (10-20 tokens) tarda entre 0,5 y 2 segundos con beam search de 4. En CPU, puede ser de 5 a 15 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `keithtwesigye/lunyoro-nllb_lun2en` | 615M | no disponible | MIT | Fine-tune de NLLB-200 para Lunyoro→Inglés |
| `keithtwesigye/lunyoro-lun2en` (MarianMT) | ~300M (estimado) | no disponible | MIT | MarianMT para Lunyoro→Inglés |
| `facebook/nllb-200-distilled-600M` | 615M | 1024 tokens | CC-BY-NC 4.0 | Modelo base multilingüe (200 lenguas) |
| `facebook/nllb-200-3.3B` | 3.3B | 1024 tokens | CC-BY-NC 4.0 | Modelo grande multilingüe |

El modelo fine-tuneado ofrece una ventaja sobre el NLLB-200 base al estar especializado en el par Lunyoro→Inglés, lo que probablemente mejora la precisión en vocabulario y expresiones locales. Sin embargo, la licencia MIT del fine-tune permite uso comercial sin restricciones, a diferencia del modelo base de Meta (CC-BY-NC). Los modelos MarianMT del mismo autor son más ligeros pero pueden tener menor calidad en lenguas de bajos recursos.

## Limitaciones y advertencias

- El conjunto de entrenamiento es relativamente pequeño (~54k pares), lo que puede limitar la cobertura de vocabulario y la robustez ante dominios especializados (medicina, derecho, tecnología).
- No se han publicado evaluaciones formales de sesgos o alucinaciones. Como todo modelo de traducción, puede generar traducciones incorrectas o inventar contenido cuando el texto de entrada es ambiguo o contiene términos fuera de su vocabulario.
- La longitud de contexto no está documentada; el tokenizador NLLB típicamente soporta hasta 1024 tokens, pero el ejemplo de uso limita la salida a 256 tokens, lo que puede ser insuficiente para documentos largos.
- El modelo solo cubre la dirección Lunyoro→Inglés; para la dirección inversa se debe usar el modelo `lunyoro-nllb_en2lun` del mismo autor.
- Aunque la licencia MIT permite uso comercial, el modelo base NLLB-200 tiene licencia CC-BY-NC, por lo que es necesario verificar si el fine-tune hereda restricciones del modelo original en términos de atribución o uso no comercial.
- El repositorio tiene un tamaño de 42 GB, inusualmente grande para un modelo de 615M parámetros; puede contener archivos adicionales o versiones de pesos que requieran gestión de almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keithtwesigye/lunyoro-nllb_lun2en
- Modelo relacionado (en2lun): https://huggingface.co/keithtwesigye/lunyoro-nllb_en2lun
- Modelo relacionado (MarianMT lun2en): https://huggingface.co/keithtwesigye/lunyoro-lun2en
- Modelo relacionado (MarianMT en2lun): https://huggingface.co/keithtwesigye/lunyoro-en2lun
- Repositorio de la aplicación TRANSLATOR: https://github.com/chriskagenda/TRANSLATOR
- Proyecto No Language Left Behind (Meta): https://ai.meta.com/research/no-language-left-behind/
