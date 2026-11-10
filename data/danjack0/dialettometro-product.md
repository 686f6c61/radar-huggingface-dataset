# danjack0/dialettometro-product

## Resumen

Dialettometro es un clasificador de variedades regionales italianas a nivel de frase, desarrollado por Daniel Jackson (usuario `danjack0`). Resuelve un problema concreto: distinguir entre once variedades lingüísticas regionales de Italia (emiliano-romagnolo, friulano, ladino, ligur, lombardo, napolitano, piamontés, sardo, siciliano, tarantino y véneto), además de italiano estándar y una clase de rechazo `other` para texto en lenguas no objetivo. La configuración publicada en este repositorio, denominada "product", agrupa trece clases en total.

Técnicamente no es un modelo único, sino un ensamblado apilado de tres componentes: un XLM-RoBERTa base afinado para clasificación de trece clases (278 millones de parámetros, el único componente con pesos en formato safetensors), una red neuronal de n-gramas de caracteres y palabras entrenada desde cero en PyTorch, y un metamodelo de regresión logística de scikit-learn que combina las salidas de ambos. El paquete completo ocupa 1,1 GB e incluye los tres ficheros necesarios para la inferencia.

Es relevante porque aborda una tarea de identificación de dialectos con recursos limitados y porque documenta con honestidad sus limitaciones, incluida una fuga de datos detectada en la clase `other` que invalida parcialmente las métricas de los pesos publicados. El autor publica además una configuración de referencia sin fuga (`product_v2`) y una evaluación externa sobre el conjunto VarDial 2022 ITDI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado apilado: XLM-RoBERTa base (transformer encoder) + red de n-gramas de caracteres y palabras + regresión logística como metamodelo |
| Parametros totales | 278.053.645 (solo el componente XLM-RoBERTa; la red de n-gramas y el stacker no declaran recuento en la información disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (XLM-RoBERTa base admite hasta 512 tokens, pero la model card no lo especifica para este afinado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Italiano estándar y once variedades regionales: emiliano-romagnolo (eml), friulano (fur), ladino (lld), ligur (lij), lombardo (lmo), napolitano (nap), piamontés (pms), sardo (sc), siciliano (scn), tarantino, véneto (vec); más clase `other` para rechazo |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | safetensors (XLM-RoBERTa), PyTorch `.pt` (red de n-gramas), joblib/pickle (stacker) |

## Arquitectura y entrenamiento

El sistema es un ensamblado de tres etapas. La primera es un XLM-RoBERTa base afinado para clasificación de trece clases. La segunda es una red neuronal de n-gramas de caracteres y palabras implementada en PyTorch, entrenada desde cero. La tercera es una regresión logística de scikit-learn que actúa como metamodelo apilado sobre las salidas de las dos anteriores. El conjunto se distribuye en tres ficheros separados y requiere los scripts del proyecto para cargarse, no un pipeline estándar de `transformers`.

Los datos de entrenamiento proceden de las ediciones de Wikipedia de cada variedad lingüística (licencia CC-BY-SA 4.0) para las clases dialectales y del italiano estándar, y de frases de Tatoeba en treinta lenguas (CC-BY 2.0 FR) para la clase `other`. La partición es por artículo de origen, con un reparto sensible al recuento de filas para que cada clase se acerque a su cuota objetivo de test. El conjunto VarDial 2022 ITDI se usó exclusivamente para evaluación, nunca para entrenamiento. No se documentan en la información disponible detalles sobre RLHF, DPO ni innovaciones como decodificación especulativa o atención lineal.

Un aspecto crítico: los pesos publicados en este repositorio son los modelos originales de la configuración "product", entrenados antes de que se detectara y corrigiera una fuga de datos en la clase `other`. Esa fuga invalida la puntuación de `other` en el conjunto de validación de los modelos originales, no los modelos en sí. Las métricas que el autor recomienda citar provienen del reentrenamiento sin fuga (`product_v2`), con la misma arquitectura.

## Capacidades

- Clasificación de texto a nivel de frase en trece categorías: once variedades regionales italianas, italiano estándar y `other`.
- Rechazo de lenguas no objetivo mediante la clase `other`, siempre que se use el ensamblado completo (el modelo de n-gramas por sí solo rechaza mal lenguas no vistas).
- Umbral de confianza configurable (`--floor`, por defecto 0.60) que permite responder "no estoy seguro" en lugar de forzar una predicción.
- Funcionamiento en dos modos: completo (XLM-RoBERTa + n-gramas + stacker) o ligero (solo n-gramas, sin descargar el transformer de 1,1 GB).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento. Es exclusivamente un clasificador.

## Casos de uso

- Clasificación de corpus dialectales para investigación lingüística: el modelo permite etiquetar automáticamente frases extraídas de Wikipedia, foros o redes sociales según su variedad regional, reduciendo el trabajo manual de anotación en estudios de dialectología y sociolingüística.
- Filtrado y enrutado en pipelines de procesado de lenguaje: en un sistema que deba aplicar modelos específicos por variedad (por ejemplo, un normalizador léxico distinto para napolitano y siciliano), el clasificador decide qué rama activar antes de procesar la frase.
- Rechazo de contenido no italiano en sistemas multilingües: la clase `other` con el stacker completo permite descartar entradas en lenguas no objetivo antes de pasarlas a modelos más costosos, usando el umbral `--floor` para dejar pasar solo predicciones fiables.
- Análisis de registro en textos de Wikipedia: dado que el modelo se entrenó con texto enciclopédico, es adecuado para auditar y clasificar grandes volúmenes de artículos de las wikis regionales, donde su rendimiento in-domain es el mejor documentado (macro-F1 de 0,8811 con el stacker).
- Etiquetado asistido en proyectos de preservación lingüística: para variedades con pocos recursos como el ladino o el emiliano-romagnolo, el modelo sirve como primera pasada de anotación que un experto revisa después, aprovechando su alta precisión en ladino aunque su exhaustividad sea baja.
- Demostración educativa de ensamblados apilados: el repositorio incluye los tres componentes por separado y scripts de carga, lo que lo convierte en un ejemplo reproducible de cómo combinar un transformer afinado con un modelo clásico de n-gramas mediante un metamodelo de regresión logística.
- Punto de partida para ajuste fino: al estar basado en XLM-RoBERTa base con licencia CC-BY-SA 4.0, puede reutilizarse como inicialización para tareas relacionadas con variedades romances, siempre respetando la cláusula de compartir igual.

## Benchmarks y rendimiento

Macro-F1 sobre una partición retenida a nivel de artículo de los datos propios derivados de Wikipedia, en la configuración `product_v2` (sin fuga, con cinco lenguas `other` retenidas por completo del entrenamiento):

| Modelo | Macro-F1 |
|---|---|
| n-gramas | 0.7554 |
| XLM-RoBERTa | 0.8188 |
| Stacker (ensamblado) | 0.8811 |

Evaluación externa sobre el conjunto de test VarDial 2022 ITDI (registro informal, solo evaluación):

| Sistema | Weighted-F1 |
|---|---|
| Stacker de paridad ITDI de 11 clases (no publicado en este repositorio) | 0.5707 |
| Mejor baseline oficial | 0.7726 |

Estas cifras corresponden al reentrenamiento `product_v2`, no a los pesos publicados en este repositorio, cuyas puntuaciones de `other` están invalidadas por la fuga detectada. El rendimiento por clase en dominio incluye un F1 de 0,94-0,96 para tarantino, que cae a 0,21 sobre texto informal de ITDI, y un recall de 0,24-0,47 para ladino.

## Requisitos de hardware

- VRAM estimada para inferencia: el componente transformer tiene 278 millones de parámetros; en fp32 ocupa aproximadamente 1,1 GB de pesos, en fp16 unos 560 MB y en int8 unos 280 MB. La red de n-gramas y el stacker añaden una huella pequeña no cuantificada en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre puede ejecutar el ensamblado completo en fp16. Una RTX 3060, RTX 4060 o superior es suficiente; A100 y H100 no aportan ventaja significativa para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna (GTX 1660, RTX 2060 en adelante) e incluso en CPU para el modo ligero de solo n-gramas.
- Opciones de despliegue: los scripts propios del proyecto (`scripts/app.py`) son el método documentado; el repositorio incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con TEI y endpoints de Hugging Face, aunque la carga del stacker requiere los dos modelos base y no un pipeline estándar de `transformers`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dialettometro (product) | 278 M (transformer) + n-gramas + stacker | No disponible | Clasificación de 13 clases (11 variedades italianas + italiano + other) | CC-BY-SA 4.0 | Hugging Face + GitHub |
| XLM-RoBERTa base (FacebookAI) | 278 M | 512 tokens | Modelo base multilingüe, sin cabeza de clasificación dialectal | MIT | Hugging Face |
| Baselines oficiales VarDial 2022 ITDI | No disponible | No disponible | Identificación de variedades italianas (11 clases) | No disponible | VarDial 2022 |
| Modelo de n-gramas del propio proyecto | No disponible | No aplica | Clasificación de 13 clases, modo ligero | CC-BY-SA 4.0 | Incluido en el repositorio |

La comparación directa más útil es con el baseline oficial de VarDial 2022, donde el stacker de paridad ITDI del autor obtiene 0,5707 de weighted-F1 frente a 0,7726 del mejor baseline oficial, lo que indica que en registro informal el sistema queda por debajo del estado del arte de esa competición. Frente a XLM-RoBERTa base sin afinar, el afinado aporta la cabeza de clasificación dialectal, pero la información disponible no incluye una comparación de rendimiento entre ambos.

## Limitaciones y advertencias

- Cambio de registro: el modelo se entrenó con texto enciclopédico de Wikipedia y su precisión cae en texto informal o hablado. El caso documentado es tarantino, que pasa de 0,94-0,96 de F1 en dominio a 0,21 sobre texto informal de ITDI, confundiéndose con napolitano y siciliano.
- Ladino: alta precisión pero recall bajo (0,24-0,47) por un conjunto de entrenamiento pequeño.
- Emiliano-romagnolo: es la clase más pequeña (548 filas) y su Wikipedia contiene sobre todo esbozos cortos, lo que limita el aprendizaje.
- El modelo de n-gramas por sí solo rechaza mal las lenguas no vistas; para entradas que puedan no ser italianas hay que usar el ensamblado completo.
- Solo a nivel de frase; no está pensado para entradas muy cortas (una o dos palabras).
- Fuga de datos en la clase `other` de los pesos publicados: las métricas de `other` de estos ficheros no son válidas. Las cifras citables son las de `product_v2`, que no está publicado en este repositorio.
- El fichero `product_stacker.joblib` es un pickle de joblib; como cualquier pickle, solo debe cargarse desde una fuente de confianza.
- Licencia CC-BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios que no quieran liberar su código o pesos derivados.
- Riesgo de alucinación no aplica en sentido estricto al ser un clasificador, pero sí existe riesgo de predicciones erróneas con alta confianza en registros distintos al de entrenamiento; el umbral `--floor` mitiga parcialmente este problema.
- No se documentan sesgos demográficos ni sociolingüísticos específicos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danjack0/dialettometro-product
- Repositorio GitHub del proyecto: https://github.com/danjack0/dialettometro
- Sección sobre la corrección de la clase `other`: https://github.com/danjack0/dialettometro#fixed-the-product-other-class-is-now-genuinely-held-out-product_v2
- Demo en vivo (solo modelo de n-gramas): https://dialettometro.onrender.com
- Modelo base XLM-RoBERTa: https://huggingface.co/FacebookAI/xlm-roberta-base
- Conjunto VarDial 2022 ITDI: no disponible en la información proporcionada
