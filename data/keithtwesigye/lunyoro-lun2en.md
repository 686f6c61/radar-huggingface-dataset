# keithtwesigye/lunyoro-lun2en

## Resumen

El modelo `keithtwesigye/lunyoro-lun2en` es un modelo de traducción automática neuronal (NMT) especializado en la traducción de Lunyoro/Rutooro a inglés. Lo ha desarrollado el autor `keithtwesigye` como parte de una serie de modelos para cubrir una lengua bantú de Uganda hablada en los reinos de Bunyoro-Kitara y Tooro. Entrena un MarianMT sobre un conjunto de unos 53.948 pares de frases en inglés y Lunyoro, compilados mediante aportaciones de hablantes, entradas de diccionario, corpus paralelos y aumentación por back-translation.

Se trata de un modelo pequeño, con 77.058.732 parámetros, y su formato de pesos es `safetensors`. La arquitectura es una encoder-decoder Transformer de la familia MarianMT, conocida por su eficiencia en tareas de traducción entre idiomas con recursos limitados. El modelo está pensado para abordar la escasez de recursos lingüísticos para lenguas africanas minoritarias, y su relevancia radica en la preservación y digitalización del Lunyoro/Rutooro, así como en la construcción de sistemas de traducción accesibles para comunidades de Uganda.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (encoder-decoder Transformer) |
| Parametros totales | 77.058.732 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | rw (Lunyoro/Rutooro), en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base `Helsinki-NLP/opus-mt-mul-en` y ha sido fine-tuneado específicamente para el par Lunyoro/Rutooro-inglés. La arquitectura MarianMT es un transformer estándar con codificador y decodificador, optimizado para secuencias de texto. El proceso de entrenamiento se realizó durante 10 épocas con el optimizador AdamW y una programación de tasa de aprendizaje coseno, usando una GPU NVIDIA con CUDA.

El dataset de entrenamiento está compuesto por aproximadamente 53.948 pares de frases inglesas y lunyoro, construido a partir de aportaciones crowdsourced, entradas de diccionario Runyoro-Rutooro en formato Excel, corpus paralelos y aumentación mediante back-translation. Aunque no se detalla la longitud de contexto utilizada, el enfoque de MarianMT suele manejar ventanas de decodificación de 512 tokens, pero este dato no se confirma en la información disponible.

## Capacidades

- Traducción de texto de Lunyoro/Rutooro a inglés, tanto en frases cortas como en párrafos.
- Generación de traducciones con `num_beams=4` y una longitud máxima de decodificación de 256 tokens según el ejemplo de uso del autor.
- Soporte de tokenization específica del modelo MarianMT, con la clase `MarianTokenizer` de la librería Transformers.
- Modelo exclusivamente de traducción: no se indica soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- Capacidad multilingüe limitada a dos idiomas: Lunyoro/Rutooro (código ISO `rw`) e inglés (`en`).
- No se dispone de información sobre modo thinking, visión o audio.

## Casos de uso

- Preservación de patrimonio lingüístico: el modelo permite digitalizar y traducir textos históricos, proverbios o relatos orales en Lunyoro/Rutooro, facilitando su conservación y difusión en inglés.
- Traducción de materiales educativos: docentes de las regiones de Bunyoro-Kitara y Tooro pueden convertir manuales escolares o materiales didácticos del inglés al Lunyoro, mejorando el acceso a la educación en la lengua materna.
- Localización de contenidos digitales: organizaciones de Uganda pueden traducir páginas web, anuncios o aplicaciones móviles al inglês para llegar a hablantes de Lunyoro, o viceversa.
- Documentación de testimonios y entrevistas: investigadores en antropología o lingüística pueden transcribir y traducir entrevistas grabadas en Lunyoro a inglés, agilizando el análisis y la publicación de resultados.
- Desarrollo de chatbots de atención ciudadana: el modelo, integrado en un pipeline de traducción, permite que servicios públicos de Uganda atiendan consultas en Lunyoro y respondan en inglés, ampliando la cobertura de servicios bilingües.
- Traducción de textos jurídicos y administrativos: documentos locales como contratos, formularios o actas pueden pasarse al inglés, reduciendo la dependencia de traductores humanos en zonas con escasez de recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo con 77 millones de parámetros, requiere aproximadamente 0,5 GB de VRAM en FP32, y menos si se usa cuantización (aunque no se especifican tipos disponibles). En CPU, la huella de memoria es inferior a 1 GB.
- GPU recomendadas: cualquier GPU moderna dedicada (por ejemplo, RTX 3060 o superior) es más que suficiente; también puede ejecutarse en CPU de forma aceptable.
- Capacidad en GPU de consumo: sí, cabe en cualquier consumer GPU actual.
- Opciones de despliegue: el modelo se puede cargar con la biblioteca `transformers` y PyTorch, usando `MarianMTModel` y `MarianTokenizer`. No se mencionan configuraciones específicas para vLLM, llama.cpp o TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `keithtwesigye/lunyoro-lun2en` | 77.058.732 | No disponible | MIT | HuggingFace |
| `keithtwesigye/lunyoro-en2lun` | No disponible | No disponible | MIT | HuggingFace |
| `keithtwesigye/lunyoro-nllb_lun2en` | No disponible | No disponible | No disponible | HuggingFace |
| `Helsinki-NLP/opus-mt-mul-en` | No disponible | No disponible | No disponible | HuggingFace |

Nota: `lunyoro-nllb_lun2en` es un fine-tune de NLLB-200, por lo que su arquitectura base es distinta, pero los datos concretos de este modelo no se detallan.

## Limitaciones y advertencias

- Sesgos: el entrenamiento con datos procedentes de crowdsourcing y back-translation puede introducir sesgos regionales o de género, ya que no se documenta ningún proceso de mitigación.
- Riesgo de alucinación: al tratarse de un modelo pequeño entrenado con un corpus limitado (unas 54.000 pares), puede producir traducciones inexactas o inventar términos en contexteos poco cubiertos.
- Limitaciones de idioma: el modelo solo cubre Lunyoro/Rutooro e inglés; no incluye variedades dialectales más amplias ni otros idiomas bantúes.
- Restricciones de contexto: la longitud de contexto no se ha publicado, lo que obliga a truncar entradas largas y puede degradar la traducción de documentos extensos.
- Caveats para producción: el modelo no ha pasado por una evaluación de calidad exhaustiva, por lo que no se recomienda para traducción legal o médica sin revisión humana.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías de rendimiento ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/keithtwesigye/lunyoro-lun2en
- Modelo relacionado `lunyoro-en2lun`: https://huggingface.co/keithtwesigye/lunyoro-en2lun
- Modelo relacionado `lunyoro-nllb_en2lun`: https://huggingface.co/keithtwesigye/lunyoro-nllb_en2lun
- Modelo relacionado `lunyoro-nllb_lun2en`: https://huggingface.co/keithtwesigye/lunyoro-nllb_lun2en
- Repositorio de la aplicación completa: https://github.com/chriskagenda/TRANSLATOR
