# mradermacher/HealthyCompetition-GGUF

## Resumen

HealthyCompetition-GGUF es una colección de cuantizaciones en formato GGUF del modelo base Karako64/HealthyCompetition, publicada por mradermacher, un conocido generador de cuantizaciones de la comunidad de Hugging Face. El modelo base es un transformer de aproximadamente 163 millones de parámetros (dato extraído de los pesos safetensors del repositorio), lo que lo sitúa en la categoría de modelos pequeños, aptos para inferencia en CPU y GPUs de consumo. No se dispone de información publicada sobre el proceso de entrenamiento, la composición del dataset ni la longitud de contexto del modelo base.

El repositorio ofrece únicamente pesos cuantizados estáticos (Q2_K hasta Q8_0, además de f16), orientados a su uso con llama.cpp y herramientas compatibles. La cuantización imatrix (i1) se publica en un repositorio separado. El modelo declara soporte exclusivo para inglés y no especifica licencia, lo que limita su uso comercial sin aclaración previa por parte del autor original.

La relevancia de esta ficha es acotada: se trata de una cuantización de conveniencia de un modelo de nicho, con escasa documentación técnica y sin benchmarks publicados. Resulta útil para quien necesite ejecutar el modelo base en hardware modesto, pero no debe considerarse una opción de producción sin antes verificar la licencia y el comportamiento del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 163.037.184 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; imatrix (i1) en repositorio separado |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base usa safetensors |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo base Karako64/HealthyCompetition más allá de que se trata de un transformer. El recuento de parámetros (163 millones) corresponde a los pesos safetensors del modelo original, y el tamaño del repositorio cuantizado (1,6 GB) es coherente con las doce variantes GGUF incluidas. Se desconoce el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO y cualquier innovación técnica (atención lineal, decodificación especulativa, etc.).

La aportación técnica del repositorio es exclusivamente la cuantización: mradermacher aplica el pipeline estándar de conversión a GGUF (convert_type hf) y publica variantes estáticas sin imatrix en este repositorio, mientras que las versiones ponderadas con imatrix se alojan en HealthyCompetition-i1-GGUF. No hay información sobre la tokenizador, el vocabulario ni la ventana de contexto efectiva.

## Capacidades

- Generación de texto en inglés: capacidad básica esperada de un modelo de 163 millones de parámetros, sin datos publicados que la cuantifiquen.
- Razonamiento y matemáticas: no disponible; no se han publicado evaluaciones.
- Generación de código: no disponible; no se han publicado evaluaciones.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible; no se documenta ninguna.

## Casos de uso

- Prototipado local en CPU: gracias a las cuantizaciones Q4_K_S y Q4_K_M (aproximadamente 0,2 GB), el modelo puede ejecutarse en portátiles sin GPU mediante llama.cpp u Ollama, lo que permite validar pipelines de generación de texto antes de escalar a modelos mayores.
- Experimentación educativa: con 163 millones de parámetros y variantes desde Q2_K hasta f16, es útil para estudiar el impacto de la cuantización en la perplejidad y la calidad de salida en un modelo pequeño.
- Generación de texto de relleno en inglés: tareas de completado breve, resúmenes de una frase o etiquetado simple donde la latencia importa más que la calidad, ejecutables en hardware de gama baja.
- Pruebas de integración de GGUF: sirve como modelo de prueba para validar cargadores, scripts de inferencia y despliegues con llama.cpp antes de usar modelos de mayor tamaño.
- Filtrado o clasificación preliminar en inglés: con contexto corto y tareas acotadas, puede emplearse como primer filtro en pipelines que luego derivan a un modelo mayor.
- Demostraciones offline: al caber en 0,2-0,4 GB, es adecuado para entornos sin conectividad o con recursos muy limitados donde se requiera generación de texto en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,2 GB para Q2_K a Q5_K_M; 0,3 GB para Q8_0; 0,4 GB para f16. Cabe en cualquier GPU de consumo con al menos 1 GB de VRAM libre.
- GPU recomendadas: cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090, A100, H100); el modelo es demasiado pequeño para aprovechar GPUs de datacenter.
- CPU: ejecutable en CPU sin GPU; las cuantizaciones Q4_K_S y Q4_K_M son las recomendadas por el autor por su relación velocidad/calidad.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio declara la etiqueta endpoints_compatible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| HealthyCompetition-GGUF | 163 M | no disponible | no disponible | GGUF | Cuantización de comunidad, solo inglés |
| mradermacher/HealthyCompetition-i1-GGUF | 163 M | no disponible | no disponible | GGUF (imatrix) | Misma base, cuantización ponderada |
| Karako64/HealthyCompetition | 163 M | no disponible | no disponible | safetensors | Modelo base original |

No se dispone de información sobre otros modelos comparables de la misma categoría (modelos de ~160 M parámetros) en la documentación proporcionada, por lo que no se puede establecer una comparativa de rendimiento fiable.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; es imprescindible contactar con el autor del modelo base (Karako64) antes de usarlo en producción.
- Sin benchmarks: no hay datos objetivos de calidad, lo que impide evaluar su idoneidad frente a alternativas.
- Idioma limitado al inglés: no se documenta soporte para castellano ni otros idiomas.
- Riesgo de alucinación: esperable en un modelo de 163 millones de parámetros sin datos de alineación publicados; la fiabilidad factual será baja.
- Contexto desconocido: no se publica la longitud de ventana, lo que impide planificar conversaciones multi-turno o documentos largos.
- Documentación mínima: la model card del repositorio cuantizado es genérica y no describe el modelo base.
- Modelo de nicho: 25 descargas y 0 likes en el momento de la consulta, sin comunidad activa que reporte problemas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/HealthyCompetition-GGUF
- Repositorio imatrix: https://huggingface.co/mradermacher/HealthyCompetition-i1-GGUF
- Modelo base: https://huggingface.co/Karako64/HealthyCompetition
- Página de resumen del autor: https://hf.tst.eu/model#HealthyCompetition-GGUF
- Ficha en MyGGUF: https://mygguf.com/model?id=mradermacher%2FHealthyCompetition-i1-GGUF
- README de referencia para GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
