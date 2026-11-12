# mradermacher/Qwen2.5-Coder-32B-Instruct-abliterated-v3-GGUF

## Resumen

Qwen2.5-Coder-32B-Instruct-abliterated-v3-GGUF es una distribucion de cuantizaciones GGUF del modelo Qwen2.5-Coder-32B-Instruct-abliterated-v3, publicado por el usuario jsantillana. El modelo original parte de Qwen2.5-Coder-32B-Instruct, desarrollado por Alibaba Qwen, al que se le ha aplicado una tecnica de "abliteration" orientada a eliminar la direccion de rechazo (refusal direction) del modelo. Este repositorio, mantenido por mradermacher, ofrece los pesos en formato GGUF con multiples niveles de cuantizacion para facilitar su ejecucion en hardware de consumo.

El modelo conserva la arquitectura transformer densa de Qwen2.5-Coder-32B, con 32.763.876.352 parametros totales, y esta especializado en generacion de codigo, razonamiento tecnico y tareas de ciberseguridad. La abliteration elimina los mecanismos de rechazo aprendidos durante el alineamiento, lo que lo hace relevante para investigacion en interpretabilidad, analisis de seguridad ofensiva y estudios sobre alineamiento, pero tambien lo convierte en un modelo con riesgos significativos para uso en produccion sin salvaguardas adicionales.

La licencia es "apache-2.0-restricted-research", una variante restringida a investigacion, lo que limita explicitamente su uso comercial. El repositorio incluye cuantizaciones desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB), lo que permite desplegarlo en un rango amplio de configuraciones de GPU, desde consumer de gama alta hasta servidores dedicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-Coder-32B) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en, es |
| Licencia | apache-2.0-restricted-research |
| Formato de pesos | GGUF (cuantizaciones estaticas); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-Coder-32B-Instruct, un transformer denso de 32.700 millones de parametros desarrollado por Alibaba Qwen. La variante abliterated-v3 de jsantillana aplica una tecnica de abliteration que identifica y sustrae la direccion de rechazo en el espacio de activaciones, eliminando la tendencia del modelo a negarse a responder ciertas peticiones. Este proceso se realiza sobre los pesos del modelo instruct original, preservando la mayor parte de sus capacidades de generacion de codigo y razonamiento.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO especificas para esta variante. La abliteration es una intervencion post-entrenamiento que no requiere reentrenamiento completo, sino un ajuste quirurgico de los pesos basado en el analisis de direcciones de activacion. El repositorio de mradermacher se limita a generar cuantizaciones estaticas GGUF del modelo base, sin aplicar quantizaciones ponderadas o imatrix, segun indica el propio autor.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, heredada de Qwen2.5-Coder-32B-Instruct.
- Razonamiento tecnico y resolucion de problemas de programacion.
- Tareas de ciberseguridad, incluyendo analisis de vulnerabilidades y generacion de exploits (sin los rechazos del modelo original).
- Generacion de texto conversacional en ingles y espanol.
- Soporte de tool calling y function calling (heredado del modelo instruct base).
- Capacidades de agente y razonamiento multi-paso.
- Respuestas sin mecanismos de rechazo ante peticiones que el modelo original rechazaria.
- Interpretabilidad y estudio de direcciones de rechazo en modelos alineados.

## Casos de uso

- Investigacion en interpretabilidad y alineamiento: el modelo permite estudiar como la abliteration afecta a las representaciones internas y al comportamiento del modelo, comparando respuestas con el original para analizar la direccion de rechazo.
- Analisis de seguridad ofensiva controlado: en entornos de laboratorio aislados, el modelo puede generar pruebas de concepto y analisis de vulnerabilidades sin las negativas del modelo alineado, util para equipos de red team.
- Generacion de codigo en pipelines internos: con cuantizacion Q4_K_M (20 GB) puede desplegarse en una GPU de 24 GB para autocompletado y generacion de codigo en herramientas de desarrollo internas.
- Auditoria de codigo y revision de seguridad: el modelo puede analizar fragmentos de codigo en busca de patrones inseguros, con contexto conversacional multi-turno.
- Educacion y formacion en ciberseguridad: en entornos docentes controlados, permite explicar tecnicas de explotacion y defensa sin filtros que interrumpan el flujo pedagogico.
- Estudio comparativo de cuantizaciones: el repositorio ofrece 10 niveles de cuantizacion, lo que permite medir el impacto de la cuantizacion en la calidad de generacion de codigo y en la persistencia de la abliteration.
- Despliegue local en estaciones de trabajo: con Q4_K_S (18,9 GB) cabe en GPU consumer de 24 GB, permitiendo inferencia local sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~12,4 GB; Q3_K_S ~14,5 GB; Q3_K_M ~16,0 GB; Q3_K_L ~17,3 GB; Q4_K_S ~18,9 GB; Q4_K_M ~20,0 GB; Q5_K_S ~22,7 GB; Q5_K_M ~23,4 GB; Q6_K ~27,0 GB; Q8_0 ~34,9 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_M; A100 40 GB o H100 para Q6_K y Q8_0; RTX 3090 (24 GB) para Q4_K_S y Q4_K_M.
- Cabe en GPU consumer: si, en RTX 3090, RTX 4090 y GPUs con 24 GB o mas para cuantizaciones Q4 y Q5. Las cuantizaciones Q6_K y Q8_0 requieren 27-35 GB, fuera del alcance de consumer de gama alta.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-32B-Instruct (original) | 32,7B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo alineado con rechazos; referencia de calidad |
| Qwen2.5-Coder-32B-Instruct-abliterated-v3 (base de este repo) | 32,7B | no disponible | apache-2.0-restricted-research | safetensors | Version abliterated sin cuantizar |
| Este modelo (GGUF de mradermacher) | 32,7B | no disponible | apache-2.0-restricted-research | GGUF (10 cuantizaciones) | Distribucion cuantizada para inferencia local |
| DeepSeek-Coder-33B-Instruct | 33B | no disponible | no disponible | safetensors, GGUF | Alternativa de codigo de tamano similar (datos no verificados en esta ficha) |

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido danino, codigo malicioso o instrucciones peligrosas sin filtros.
- La licencia "apache-2.0-restricted-research" restringe el uso a investigacion; no esta permitido el uso comercial sin autorizacion explicita.
- Riesgo elevado de alucinacion en tareas tecnicas, especialmente en cuantizaciones bajas (Q2_K, Q3_K_S) donde la calidad se degrada.
- La cuantizacion puede afectar a la persistencia de la abliteration; no se han publicado evaluaciones que confirmen que el comportamiento sin rechazos se mantiene en todos los niveles de cuantizacion.
- Idiomas soportados limitados a ingles y espanol; el rendimiento en otros idiomas no esta garantizado.
- No se dispone de informacion sobre la longitud de contexto efectiva de esta variante; se recomienda verificar con el modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- Uso en produccion desaconsejado sin salvaguardas externas, filtros de salida y supervision humana, dado el caracter abliterated del modelo.
- El autor de las cuantizaciones indica que no hay quants ponderados/imatrix disponibles, lo que puede reducir la calidad respecto a cuantizaciones optimizadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen2.5-Coder-32B-Instruct-abliterated-v3-GGUF
- Modelo base (abliterated): https://huggingface.co/jsantillana/Qwen2.5-Coder-32B-Instruct-abliterated-v3
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2.5-Coder-32B-Instruct-abliterated-v3-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
