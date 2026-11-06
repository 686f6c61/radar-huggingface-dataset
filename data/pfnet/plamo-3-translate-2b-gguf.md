# pfnet/plamo-3-translate-2b-GGUF

## Resumen

PLaMo 3 Translate 2B es un modelo de lenguaje especializado en traducción desarrollado por Preferred Networks (PFN). Se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, y se entrena adicionalmente con decenas de miles de millones de tokens de datos orientados a traducción. El resultado es un modelo de 2.878.595.584 parámetros que cubre 53 idiomas y que, según el autor, supera en calidad de traducción a los LLM especializados comparados en todas las métricas evaluadas.

La variante aquí descrita es la conversión a formato GGUF y su cuantización para llama.cpp, publicada en el repositorio `pfnet/plamo-3-translate-2b-GGUF`. Esto la hace ejecutable en entornos de inferencia local y en hardware de consumo, algo relevante para equipos que necesitan traducción multilingüe sin depender de APIs externas ni de GPUs de centro de datos.

El modelo admite contexto adicional y glosarios como entrada, permite elegir entre estilo llano y cortés en la salida en japonés, y entrena con una longitud máxima de 32.768 tokens sumando entrada y salida. La licencia es la PLaMo Community License, con uso no comercial gratuito y condiciones específicas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de traducción; detalles no publicados en la informacion disponible) |
| Parametros totales | 2.878.595.584 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens maximos en entrenamiento (entrada + salida combinadas) |
| Tipos de cuantizacion | GGUF (este repositorio); el autor publica ademas FP8, W4A16, W4AFP8, NVFP4 y MLX-4bit en repositorios separados |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | plamo-community-license (uso no comercial gratuito sin registro previo; condiciones especificas para uso comercial) |
| Formato de pesos | GGUF (repo de 12,5 GB); el modelo base en safetensors esta en `pfnet/plamo-3-translate-2b` |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna exacta (número de capas, dimensión oculta, tipo de atención) del modelo base. Sí se sabe que PLaMo 3 Translate 2B parte de PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT, y que sobre esa base se aplicó un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción. La longitud máxima durante el entrenamiento fue de 32.768 tokens considerando entrada y salida en conjunto, lo que condiciona el uso práctico: pasajes más largos deben dividirse.

El modelo incorpora dos mecanismos de control relevantes para traducción profesional: la posibilidad de aportar contexto circundante y un glosario terminológico como parte de la entrada, y la selección entre estilo llano y cortés para la salida en japonés. No se especifica en la información proporcionada si hubo fases de RLHF o DPO, ni la composición exacta del dataset de entrenamiento. La versión GGUF es una conversión y cuantización del modelo base para llama.cpp; el autor advierte que la cuantización introduce cambios de precisión respecto a BF16, cuantificados en tablas comparativas en la model card original.

## Capacidades

- Traducción entre 53 idiomas, incluyendo pares que no pasan por el inglés como pivote.
- Traducción con contexto adicional: permite pasar texto circundante para desambiguar y mantener coherencia en documentos largos.
- Traducción guiada por glosario: admite terminología específica para forzar consistencia terminológica.
- Control de estilo en japonés: elección entre registro llano y cortés en la salida.
- Procesamiento de pasajes largos en una sola pasada, hasta el límite combinado de 32.768 tokens de entrada y salida.
- Formato conversacional (etiqueta `conversational` en el repositorio), apto para integrarse en plantillas de chat de llama.cpp.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue tras una API compatible con el ecosistema Hugging Face.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión ni audio; el modelo está especializado en traducción.

## Casos de uso

- Traducción de documentación técnica multilingüe: el modelo puede procesar secciones completas en una sola pasada gracias al límite de 32.768 tokens combinados, manteniendo coherencia terminológica mediante glosarios por producto.
- Localización de interfaces y contenido web: con 53 idiomas cubiertos, un mismo pipeline sirve para mercados que habitualmente requieren varios proveedores; la variante GGUF permite ejecutarlo en servidores sin GPU dedicada.
- Traducción de correspondencia comercial japonés-inglés: el control de estilo llano o cortés en japonés es directamente aplicable a correos y comunicaciones con clientes, donde el registro importa.
- Subtitulado y traducción de conversaciones: el formato conversacional y el contexto adicional permiten mantener referencias entre turnos en diálogos multi-turno.
- Procesamiento por lotes en local para sectores con requisitos de privacidad: al ejecutarse con llama.cpp sobre hardware propio, los textos no salen de la infraestructura, lo que encaja en entornos legales, sanitarios o administrativos.
- Traducción asistida para investigación académica: el uso no comercial es gratuito sin registro previo, lo que facilita su adopción en universidades para traducir artículos y materiales entre los idiomas cubiertos.
- Preprocesamiento en pipelines de datos: traducción masiva de corpus para entrenamiento o análisis, con la ventaja de que la cuantización reduce los requisitos de memoria frente a BF16.

## Benchmarks y rendimiento

El autor publica gráficas de calidad de traducción en la model card, pero no tablas con valores numéricos en la información disponible. Los ejes de evaluación son los siguientes:

| Evaluacion | Metrica | Ambito |
|---|---|---|
| Japones-ingles | Media de PFTB, SaaS y WMT24++ COMET-22 | Calidad global japones-ingles |
| Japones y 14 idiomas | Media de FLORES+ chrF++ en ambas direcciones | Multilingue con japones |
| Ingles y 14 idiomas | Media de FLORES+ chrF++ en ambas direcciones | Multilingue con ingles |

Los 15 idiomas seleccionados para FLORES+ son: japonés, inglés, árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino (simplificado y tradicional), alemán, francés, vietnamita y ruso. El autor afirma que el modelo de 2B supera a los LLM especializados en traducción comparados (TranslateGemma y HY-MT2) en todas las métricas de la figura, pero no se incluyen los valores numéricos en la información proporcionada, por lo que no se reproducen cifras concretas.

## Requisitos de hardware

- VRAM estimada: no disponible con cifras del autor. Como referencia de orden de magnitud, un modelo de 2,88 mil millones de parámetros en GGUF de 4 bits ocupa del orden de 1,5 a 2 GB de pesos, y en 8 bits del orden de 3 GB, cantidades que deben sumarse al espacio para la caché KV, que crece con el contexto hasta los 32.768 tokens.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es apto para GPUs de consumo con suficiente VRAM para el contexto deseado; para contextos largos conviene hardware con más memoria.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en cuantizaciones de 4 y 8 bits, siempre que el contexto configurado no agote la memoria. No se confirma con datos del autor.
- Despliegue: llama.cpp es el runtime objetivo de esta variante; también es compatible con frontends y servidores basados en llama.cpp (por ejemplo, servidores compatibles con la API de OpenAI). El autor publica además variantes FP8, W4A16, W4AFP8, NVFP4 y MLX-4bit para otros runtimes.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 2B (esta ficha) | 2,88 B | 32.768 (entrada + salida) | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| PLaMo 3 Translate 0.8B | 0,8 B (aproximado por denominacion) | no disponible | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| PLaMo 3 Translate 8B | 8 B (aproximado por denominacion) | no disponible | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

TranslateGemma y HY-MT2 aparecen como modelos de comparación en los benchmarks del autor, pero no se dispone de sus especificaciones en la información proporcionada. La comparación más directa y fiable es dentro de la propia familia PLaMo 3 Translate: el 0.8B para entornos muy restringidos, el 2B como equilibrio, y el 8B y 31B cuando la calidad prima sobre el coste de inferencia.

## Limitaciones y advertencias

- La cuantización GGUF introduce pérdida de precisión respecto a BF16; el autor publica tablas de diferencias por formato, que conviene consultar antes de fijar una cuantización para producción.
- El límite de 32.768 tokens es la suma de entrada y salida: documentos largos deben dividirse, con el riesgo de perder coherencia entre fragmentos si no se aporta contexto adicional.
- El modelo está especializado en traducción; no debe esperarse de él razonamiento general, generación de código ni tool calling, capacidades no documentadas.
- Riesgo de alucinación y de traducciones fluentes pero infieles en idiomas de bajos recursos o en dominios muy técnicos sin glosario; el uso de glosarios y contexto mitiga pero no elimina este riesgo.
- La licencia PLaMo Community License permite uso personal, académico y no comercial sin registro, pero impone condiciones para uso comercial; es imprescindible revisar el texto completo antes de integrarlo en un producto.
- No se documentan en la información disponible sesgos específicos por idioma o dominio; como en cualquier modelo entrenado con corpus web, cabe esperar sesgos heredados de los datos.
- No se dispone de datos publicados de latencia ni throughput para esta variante GGUF; deben medirse en el hardware objetivo antes de dimensionar un servicio.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/pfnet/plamo-3-translate-2b-GGUF
- Modelo base en safetensors: https://huggingface.co/pfnet/plamo-3-translate-2b
- Blog técnico de PFN sobre la release: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community License: https://plamo.preferredai.jp/info/plamo-community-license-en
- llama.cpp: https://github.com/ggml-org/llama.cpp
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-2b-GGUF/blob/main/README_ja.md
- Variante 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante 8B: https://huggingface.co/pfnet/plamo-3-translate-8b
- Variante 31B: https://huggingface.co/pfnet/plamo-3-translate-31b
- Variante MLX-4bit del 2B: https://huggingface.co/pfnet/plamo-3-translate-2b-MLX-4bit
