# pfnet/plamo-3-translate-0.8b-W4A16

## Resumen

PLaMo 3 Translate 0.8B W4A16 es la variante cuantizada a INT4 del modelo de traducción especializado PLaMo 3 Translate 0.8B, desarrollado por Preferred Networks (PFN). El modelo base se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, y se ha entrenado adicionalmente con decenas de miles de millones de tokens de datos orientados a traducción. Esta versión concreta aplica cuantización de pesos a INT4 manteniendo las activaciones en BF16 (esquema W4A16) mediante compressed-tensors, lo que reduce el tamaño del repositorio a aproximadamente 1 GB.

El modelo resuelve el problema de la traducción automática multilingüe de alta calidad en un formato ligero y desplegable. Cubre 53 idiomas, admite contexto adicional y glosarios como entradas, y permite elegir entre estilo llano y cortés para la salida en japonés. Con 890.344.960 parámetros reales (etiquetado comercial como 0.8B), una longitud máxima de entrenamiento de 32.768 tokens para entrada y salida combinadas, y soporte nativo en vLLM, se posiciona como una opción práctica para pipelines de traducción en producción con requisitos de hardware modestos.

La relevancia actual radica en la combinación de calidad de traducción especializada, cobertura lingüística amplia (incluyendo español, catalán y euskera), licencia comunitaria que permite uso no comercial gratuito y un formato cuantizado listo para servir con vLLM. La familia completa incluye tamaños de 0.8B, 2B, 8B y 31B, con variantes BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia PLaMo 3, con código personalizado `custom_code`) |
| Parametros totales | 890.344.960 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (entrada y salida combinadas, máximo durante entrenamiento) |
| Tipos de cuantizacion | W4A16 (pesos INT4, activaciones BF16); la familia ofrece además BF16, FP8, W4AFP8, NVFP4, GGUF y MLX-4bit |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (uso no comercial gratuito; uso comercial sujeto a condiciones) |
| Formato de pesos | safetensors con compressed-tensors (INT4), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia PLaMo 3, construido sobre el modelo preentrenado PLaMo 3 NICT, desarrollado conjuntamente por PFN y NICT. Sobre esa base, PFN realizó un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción, lo que especializa el modelo para la tarea de traducción multilingüe en lugar de generación general. La longitud máxima durante el entrenamiento fue de 32.768 tokens considerando entrada y salida combinadas, lo que permite traducir pasajes largos en una sola pasada siempre que la suma de entrada y salida no supere ese límite.

La variante W4A16 aplica cuantización de pesos a INT4 manteniendo activaciones en BF16, implementada mediante compressed-tensors. Según la model card, para reproducir la evaluación del autor en vLLM debe añadirse `--dtype bfloat16` al comando de lanzamiento, de modo que las activaciones se ejecuten en BF16. La model card incluye tablas que comparan la precisión de traducción entre BF16 y las distintas variantes cuantizadas para cada tamaño, aunque los valores numéricos no están disponibles en la información proporcionada. No se detalla en la información disponible si hubo fases de RLHF o DPO, ni la composición exacta del dataset de entrenamiento.

## Capacidades

- Traducción multilingüe entre 53 idiomas, incluyendo combinaciones directas entre japonés, inglés y el resto de lenguas cubiertas.
- Uso de contexto circundante como entrada para mejorar la coherencia de la traducción.
- Soporte de glosarios para forzar terminología específica en la salida.
- Control de estilo en japonés: elección entre estilo llano y estilo cortés.
- Traducción de pasajes largos en una sola pasada, hasta el límite combinado de 32.768 tokens de entrada y salida.
- Modelo especializado en traducción, no orientado a generación general, razonamiento, código o matemáticas.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Localización de documentación técnica: el modelo puede traducir manuales y guías largas en una sola pasada gracias al límite combinado de 32.768 tokens, manteniendo coherencia terminológica mediante glosarios específicos del producto.
- Traducción de sitios web y aplicaciones: con 53 idiomas cubiertos, incluidos español, catalán y euskera, se puede integrar en pipelines de localización para generar versiones multilingües de contenido de interfaz y ayuda.
- Atención al cliente multilingüe: traducción en tiempo real de conversaciones entre agentes y clientes en distintos idiomas, con la opción de pasar contexto de la conversación previa para desambiguar.
- Traducción jurídica o administrativa asistida: uso de glosarios para fijar terminología legal o institucional y contexto adicional para mantener consistencia en documentos extensos.
- Subtitulado y traducción de contenido audiovisual: traducción de guiones y subtítulos con control de estilo, adecuado para volúmenes moderados en hardware de consumo gracias a la cuantización W4A16.
- Investigación en traducción automática: modelo ligero y de licencia gratuita para uso académico, útil como baseline especializado o para experimentos de evaluación con FLORES+ y WMT24++.
- Procesamiento por lotes en servidores modestos: el tamaño reducido del repositorio (aproximadamente 1 GB) y el soporte en vLLM permiten desplegar el modelo en GPUs de gama media para traducir grandes volúmenes de texto.

## Benchmarks y rendimiento

La model card indica que PLaMo 3 Translate obtiene calidad de traducción de primer nivel tanto en japonés-inglés como en traducción multilingüe, y que incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de la figura publicada. Las métricas empleadas son:

- Japonés-inglés: media de PFTB, SaaS y WMT24++ COMET-22.
- Japonés frente a otros 14 idiomas y inglés frente a otros 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.

Los 15 idiomas seleccionados para la evaluación FLORES+ son japonés, inglés, árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino simplificado y tradicional, alemán, francés, vietnamita y ruso. Los valores numéricos concretos de los benchmarks no están disponibles en la información proporcionada; solo se dispone de la representación gráfica referenciada en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 890 millones de parámetros con pesos INT4, el peso de los pesos ronda los 0,5 GB; con activaciones BF16 y overhead de KV cache para contexto largo, se estima un uso de VRAM de aproximadamente 1,5 a 3 GB según la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para contextos moderados; para el máximo de 32.768 tokens se recomienda una GPU con 8 GB o más (RTX 3060/4060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 y superiores, así como en Apple Silicon mediante la variante MLX.
- Opciones de despliegue: vLLM (soporte nativo, con `--dtype bfloat16`), transformers con `custom_code`, y variantes GGUF para llama.cpp/Ollama y MLX-4bit para Apple Silicon publicadas en repositorios separados.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 0.8B W4A16 | 890 M | 32.768 tokens (entrada + salida) | 53 | PLaMo Community License | safetensors INT4, GGUF, MLX, FP8, NVFP4 |
| PLaMo 3 Translate 2B W4A16 | no disponible | 32.768 tokens (entrada + salida) | 53 | PLaMo Community License | safetensors INT4, GGUF, MLX, FP8, NVFP4 |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card menciona TranslateGemma y HY-MT2 como modelos de traducción especializados incluidos en la comparativa de calidad, pero no se proporcionan sus especificaciones técnicas ni sus valores numéricos en la información disponible. Dentro de la propia familia, el 0.8B es la variante más ligera, frente a las versiones de 2B, 8B y 31B.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en traducción: no está diseñado para generación general, razonamiento, código ni matemáticas, por lo que su uso fuera de la traducción puede producir resultados pobres.
- Límite de 32.768 tokens para entrada y salida combinadas: los textos más largos deben dividirse, lo que puede romper la coherencia entre fragmentos.
- La cuantización W4A16 puede introducir degradación de precisión respecto a BF16; la model card incluye tablas comparativas, pero los valores no están disponibles en la información proporcionada.
- Riesgo de alucinación y de traducciones inexactas en dominios muy especializados o con terminología fuera del glosario; se recomienda revisión humana en contextos críticos.
- Cobertura desigual entre los 53 idiomas: la evaluación publicada se limita a 15 idiomas, por lo que el rendimiento en el resto no está documentado.
- Licencia PLaMo Community License: el uso personal, académico y no comercial es gratuito sin registro previo, pero el uso comercial está sujeto a condiciones que deben consultarse en el enlace de la licencia.
- El modelo requiere código personalizado (`custom_code`) para cargarse con transformers, lo que puede complicar la integración en algunos entornos.
- Para reproducir la evaluación del autor en vLLM es necesario especificar `--dtype bfloat16`; no hacerlo puede alterar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4A16
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante FP8: https://huggingface.co/pfnet/plamo-3-translate-0.8b-FP8
- Variante W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4AFP8
- Variante NVFP4: https://huggingface.co/pfnet/plamo-3-translate-0.8b-NVFP4
- Variante GGUF: https://huggingface.co/pfnet/plamo-3-translate-0.8b-GGUF
- Variante MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-0.8b-MLX-4bit
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community License: https://plamo.preferredai.jp/info/plamo-community-license-en
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4A16/blob/main/README_ja.md
