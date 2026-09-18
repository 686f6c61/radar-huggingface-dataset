# chrismattmann/pantogloss-500-en-v6

## Resumen

Pantogloss 500-to-English successor v6 es un ajuste fino de traducción many-to-English publicado por chrismattmann bajo licencia Apache-2.0. Parte del modelo padre RTG many-to-English (Gowda, Zhang, Mattmann y May, ACL-IJCNLP 2021 System Demonstrations) y se distribuye como artefacto de precisión completa FP32 alojado en HuggingFace, no dentro del paquete Python. El repositorio ocupa 2,2 GB y la librería asociada es `pantogloss`, con pesos en formato TensorFlow/Keras.

El modelo no introduce una arquitectura nueva: reutiliza la misma arquitectura y los mismos tokenizadores que su predecesor. El ajuste consiste en 1.000 actualizaciones acotadas de fine-tuning en PyTorch sobre 2.000 ejemplos aprobados (250 pares únicos por cada uno de estos ocho idiomas: amárico, hausa, igbo, jemer, lao, birmano, yoruba y zulú), tras lo cual los pesos aprendidos se remapean de vuelta a TensorFlow/Keras. La verificación de logits entre PyTorch y Keras pasó con un error absoluto máximo de 1,00e-5.

Su relevancia actual es acotada y fundamentalmente de investigación: el modelo tiene 0 descargas y 0 "likes" en el momento de la consulta, no es el modelo por defecto del paquete Pantogloss (ese sigue siendo Compact) y no existe artefacto Compact v6. Su interés principal radica en la documentación inusualmente transparente de su proceso de validación: la puerta de confirmación prospectiva original falló (+0,83 de mediana objetivo frente a los +1,5 exigidos) y la política de aceptación se modificó a posteriori, extremo que la propia model card declara explícitamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; misma arquitectura y tokenizadores que el modelo padre RTG many-to-English |
| Parámetros totales | No disponible |
| Parámetros activos | No procede (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el artefacto publicado es FP32 a precisión completa y no existe versión Compact v6 |
| Idiomas soportados | Traducción many-to-English; la familia se denomina "500-to-English", pero la evaluación publicada cubre 50 idiomas; mejora medida en amárico, hausa, igbo, jemer, lao, birmano, yoruba y zulú (el inglés es siempre el idioma de salida) |
| Licencia | Apache-2.0 |
| Formato de pesos | TensorFlow/Keras (pesos alojados en el repositorio de HuggingFace, no incluidos en el wheel de Python) |
| Tamaño del repositorio | 2,2 GB |
| Librería | pantogloss |
| Modelo base | chrismattmann/pantogloss-500-en |

## Arquitectura y entrenamiento

La model card no detalla la topología interna más allá de indicar que v6 usa la misma arquitectura y los mismos tokenizadores que el modelo padre RTG many-to-English, por lo que no se dispone de información sobre número de capas, dimensión oculta, mecanismo de atención ni tipo de tokenizador. Lo que sí se documenta es el procedimiento de ajuste: se parte del padre original, se ejecutan 1.000 actualizaciones acotadas de fine-tuning en PyTorch sobre 2.000 ejemplos aprobados (250 pares únicos por idioma para los ocho idiomas objetivo) y después se realiza una conversión de los pesos aprendidos de PyTorch a TensorFlow/Keras. La equivalencia funcional entre ambos backends se validó con una comprobación de logits cuyo error absoluto máximo fue de 1,00e-5.

No se menciona uso de RLHF, DPO ni decodificación especulativa. La mejora se apoya en un conjunto de ejemplos aprobados y en decodificación greedy emparejada para la comparación. El artefacto immutabilizado pasó comprobaciones de integridad y pruebas funcionales en Linux CPU/CUDA y en Apple M3 CPU/Metal; en un fixture de 12 ejemplos, las salidas greedy y beam-4 en M3 coincidieron exactamente con CUDA y sin fallos. Se trata únicamente de una prueba de humo del decodificador, no de un benchmark de calidad representativo.

## Capacidades

- Traducción automática many-to-English: convierte texto en cualquiera de los idiomas de origen soportados a inglés.
- Mejora específica y medida sobre ocho idiomas: amárico, hausa, igbo, jemer, lao, birmano, yoruba y zulú. Estos son idiomas de origen ya existentes en el padre, no ocho idiomas añadidos.
- Decodificación greedy y beam search (beam-4 verificado en el fixture de M3).
- Ejecución en CPU, CUDA y Apple Metal a través del paquete Pantogloss, con selección automática de dispositivo (`device="auto"`).
- Capacidad de traducción multilingüe orientada a investigación y texto general; la evaluación publicada abarca 50 idiomas.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo de razonamiento explícito ("thinking mode").
- No detecta el idioma de origen ni proporciona confianza calibrada en la salida.

## Casos de uso

- Indexación y búsqueda de corpus multilingües: traducir documentos en amárico, hausa, igbo, jemer, lao, birmano, yoruba o zulú al inglés permite aplicar motores de búsqueda y pipelines de NLP en inglés sobre colecciones que de otro modo quedarían fuera de alcance; los ocho idiomas citados son precisamente los que recibieron ajuste específico.
- Investigación en traducción automática de bajos recursos: el modelo sirve como punto de partida para fine-tuning adicional y como baseline reproducible, ya que la comparación se realizó sobre el split `devtest` de FLORES+ 4.6 con decodificación greedy emparejada frente al padre inmutable.
- Generación y aumento de corpus paralelos: producir traducciones al inglés de textos en lenguas de bajos recursos para ampliar conjuntos de datos de entrenamiento o evaluación, asumiendo revisión humana posterior dado que no hay verificación por hablantes nativos.
- Preprocesado para análisis posteriores: normalizar a inglés entradas multilingües antes de tareas de clasificación, extracción de entidades o resumen que solo estén disponibles en inglés.
- Soporte y atención al cliente con contenido multilingüe: traducir consultas entrantes al inglés para que un equipo angloparlante pueda interpretarlas; requiere supervisión humana porque el modelo está declarado como no apto para usos de alto riesgo sin revisión.
- Evaluación comparativa de sistemas de traducción: usar el modelo como uno de los sistemas a comparar dentro de un harness sobre FLORES+ u otro test set, empleando chrF, BLEU y COMET como métricas.
- Documentación y archivado institucional: traducir materiales de archivo escritos en lenguas de bajos recursos a inglés para facilitar su catalogación y difusión.
- Prototipado de aplicaciones de traducción: integrar el paquete `pantogloss` con `Translator.from_directory(model_dir, device="auto")` para validar flujos de traducción antes de comprometerse con un sistema en producción.

## Benchmarks y rendimiento

La model card publica resultados en el split `devtest` de FLORES+ 4.6 (8.250 frases), comparando v6 con el padre a precisión completa mediante decodificación greedy emparejada.

| Métrica | Resultado de v6 frente al padre |
|---|---|
| chrF agregado | +0,55 |
| BLEU agregado | +0,72 |
| Traducciones fallidas o vacías | 0 |
| chrF mediana de los ocho idiomas objetivo | +0,83 |
| COMET fijado | 0,83065 → 0,83478 (+0,00413) |
| Diferencia de sentence-chrF por bootstrap emparejado | +0,55 (intervalo del 95 %: +0,44 a +0,66) |

Desglose de chrF por idioma objetivo:

| Idioma | Delta chrF |
|---|---|
| Amárico | +0,38 |
| Hausa | +1,51 |
| Igbo | +0,94 |
| Jemer | +2,48 |
| Lao | +0,50 |
| Birmano | +0,73 |
| Yoruba | +1,33 |
| Zulú | +0,53 |

Regresiones observadas en idiomas no objetivo: coreano −0,34, ruso −0,13, vietnamita −0,08 y rumano −0,03 en chrF. Todas quedan dentro del suelo predeclarado de −1,0, pero la model card las califica explícitamente como regresiones reales. Las puntuaciones COMET por idioma de igbo, yoruba y zulú no se utilizan como afirmación de calidad porque el modelo COMET no declara cobertura para ellos.

Advertencias metodológicas declaradas por el autor: la puerta de confirmación prospectiva original exigía mediana objetivo +1,5 y seis idiomas a +0,75, y v6 alcanzó +0,83 y cuatro idiomas, por lo que **falló**; la política de aceptación se cambió tras conocer el resultado (a +0,5 agregado y mediano, ocho objetivos positivos, tolerancia de regresión no objetivo y suelo COMET). No se trata, por tanto, de una confirmación prospectiva independiente. Además, varios intervalos por idioma incluyen el cero, el intervalo del bootstrap es de sentence-chrF y no de chrF de corpus, y no cubre la variabilidad entre semillas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra publicada. El repositorio ocupa 2,2 GB en FP32, por lo que, como estimación orientativa basada en ese tamaño, los pesos en memoria ocuparían del orden de 2,2 GB más el espacio de activaciones y del runtime de TensorFlow.
- GPU recomendadas: no se especifican. El autor verificó funcionamiento en CUDA y en Apple M3 (CPU y Metal). Dado el tamaño de los pesos, es previsible que quepa en GPU de consumo con suficiente memoria (por ejemplo, gamas con 8-12 GB de VRAM), siempre que el runtime de TensorFlow lo permita.
- Cabe en GPU de consumo: previsiblemente sí, según el tamaño del repositorio; no hay confirmación explícita del autor sobre modelos concretos.
- Opciones de despliegue: paquete Python `pantogloss`, cargando el directorio descargado con `huggingface_hub.snapshot_download` y `Translator.from_directory(model_dir, device="auto")`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y los pesos no se incluyen en el wheel de Python.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de terceros en la información proporcionada. La comparación posible se limita a los artefactos de la propia familia Pantogloss mencionados en la model card.

| Modelo | Relación | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chrismattmann/pantogloss-500-en | Padre inmutable a precisión completa; base de la comparación | No disponible | No disponible | No disponible en la información proporcionada | HuggingFace |
| chrismattmann/pantogloss-500-en-v6 | Este modelo; FP32, fine-tune sobre ocho idiomas | No disponible | No disponible | Apache-2.0 | HuggingFace (0 descargas) |
| Pantogloss Compact | Modelo por defecto del paquete; no se ha creado versión Compact v6 | No disponible | No disponible | No disponible en la información proporcionada | Distribuido con el paquete |

No se dispone de datos sobre alternativas externas de la misma categoría (por ejemplo, modelos many-to-English de gran cobertura lingüística) en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Uso previsto restringido: investigación y traducción de texto de propósito general. No apto para aplicaciones críticas de seguridad, médicas, legales ni de alto riesgo sin revisión.
- La puerta de confirmación prospectiva original falló y la política de aceptación se relajó después de conocerse el resultado; el propio autor advierte de que esto no debe presentarse como una confirmación independiente.
- Repetición de frases: los ejemplos de confirmación en jemer muestran repetición de sintagmas en ambos modelos, y una salida greedy de v6 repite de forma notablemente más larga. Otros ejemplos aparentemente fluidos difieren en detalles concretos y no han sido revisados por hablantes nativos.
- Las comprobaciones automáticas de copia del origen y de longitud de salida son solo diagnósticas; no demuestran ausencia de alucinaciones.
- La calidad varía por idioma, dominio, escritura y frase. El modelo no detecta el idioma de origen ni ofrece confianza calibrada.
- "500-to-English" describe la procedencia del entrenamiento de la familia, no una calidad uniforme en 500 idiomas; la evaluación publicada cubre 50.
- Regresiones reales observadas en idiomas no objetivo: coreano −0,34, ruso −0,13, vietnamita −0,08 y rumano −0,03 en chrF.
- Los intervalos de confianza por idioma incluyen el cero en varios casos; la mejora agregada no garantiza mejoras por frase o dominio.
- No hay revisión por hablantes nativos del texto fuente en los ejemplos evaluados.
- Licencia Apache-2.0, que en principio permite uso comercial, pero el propio autor limita el uso previsto a investigación y traducción general, y remite a `V6-ATTRIBUTION.md` para la atribución de las fuentes de entrenamiento.
- El texto del corpus de entrenamiento, el texto de benchmarks con acceso restringido y el material futuro de Fisher/CALLHOME no se incluyen en el artefacto; los registros detallados de filtrado y transformación se mantienen en un ledger privado.
- Sesgos conocidos: no disponibles de forma explícita en la información proporcionada, más allá del sesgo derivado de la cobertura desigual entre idiomas y de los conjuntos de 250 pares por idioma.
- No es el modelo por defecto del paquete Pantogloss y no existe artefacto Compact v6, lo que complica su adopción en despliegues que dependen de esa variante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chrismattmann/pantogloss-500-en-v6
- Modelo base: https://huggingface.co/chrismattmann/pantogloss-500-en
- Fichero de atribución de fuentes de entrenamiento: `V6-ATTRIBUTION.md` dentro del repositorio de HuggingFace
- Referencia bibliográfica del modelo padre RTG many-to-English: Gowda, Zhang, Mattmann y May, "Many-to-English Machine Translation", ACL-IJCNLP 2021 System Demonstrations (no se ha proporcionado URL en la información disponible)
- Benchmarks citados: FLORES+ 4.6, split `devtest` (8.250 frases); métricas chrF, BLEU y COMET (no se han proporcionado enlaces)
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (foros sobre la variable de entorno TEMP en Windows, TechNet y Microsoft Community) y no aportan enlaces relevantes.
