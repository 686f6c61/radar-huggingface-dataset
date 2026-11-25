# oncody/Pratham-117M

## Resumen

Pratham-117M es un modelo de generacion de texto en ingles desarrollado por Rahul Chaube (publicado bajo el identificador `oncody`) como experimento formativo desde cero. Se trata de un transformer decoder-only de estilo GPT-1 con 116.534.784 parametros, 12 capas y 12 cabezas de atencion, que emplea posiciones absolutas aprendidas, post-LayerNorm y embeddings atados (tied embeddings). Tanto el tokenizador como los pesos base se entrenaron desde cero, sin partir de un modelo preentrenado.

El modelo se presenta explicitamente como experimental y sus propios resultados medidos lo confirman: una perplejidad de 559,7 y una precision top-1 del 12,04 % en el conjunto de test base (8.192 tokens), ademas de respuestas claramente incoherentes en las muestras publicadas. Tras un ajuste supervisado (SFT) sobre 1.024 ejemplos de Databricks Dolly 15k, la perdida bajo de 8,71 a 6,90, pero el modelo sigue sin producir texto utilizable en produccion.

Su relevancia es, por tanto, pedagogica y de investigacion: sirve como referencia reproducible de un pipeline completo de entrenamiento (tokenizador, preentrenamiento, SFT, exportacion a ONNX cuantizado y demo en Spaces) con licencia CC BY-SA 3.0, mas que como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-1 (12 capas, 12 cabezas), posiciones absolutas aprendidas, post-LayerNorm, embeddings atados |
| Parametros totales | 116.534.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Exportacion ONNX cuantizada de 148 MB (unica variante documentada); no se detallan esquemas de cuantizacion adicionales |
| Idiomas soportados | Ingles (en) |
| Licencia | CC BY-SA 3.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only clasico con 12 capas y 12 cabezas de atencion, que sigue el diseno de GPT-1: atencion causal, posiciones absolutas aprendidas, normalizacion posterior a cada subcapa (post-LayerNorm) y matriz de embedding compartida entre entrada y salida (weight tying). El tokenizador se entreno desde cero, sin reutilizar vocabularios existentes.

El preentrenamiento base cubrio 819.200 tokens, una cantidad muy reducida para un modelo de este tamano; la fuente del corpus y los splits a nivel de documento estan en `dataset_manifest.json` del repositorio. Sobre esa base se aplico un ajuste supervisado con 1.024 ejemplos de Databricks Dolly 15k (CC BY-SA 3.0), transformados en secuencias con formato de roles (User/Assistant) y calculo de perdida unicamente sobre las respuestas. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa. El resultado medido del preentrenamiento base (perdida 6,327; perplejidad 559,7; precision top-1 12,04 %; top-5 29,48 %) evidencia un ajuste muy deficiente.

## Capacidades

- Generacion de texto en ingles a nivel de continuacion de secuencia, con calidad muy limitada.
- Formato conversacional de dos roles (User/Assistant) heredado del SFT sobre Dolly 15k.
- No hay evidencia de razonamiento fiable, codigo, matematicas ni capacidades de vision o audio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingue: no; solo ingles.
- Modo thinking: no disponible.

## Casos de uso

- Docencia sobre entrenamiento desde cero: el repositorio incluye cuaderno de entrenamiento y documentacion que permiten reproducir el pipeline completo (tokenizador, preentrenamiento, SFT, exportacion ONNX), lo que lo hace util en cursos de introduccion a LLM.
- Referencia de linea base negativa: sirve para comparar curvas de perdida y perplejidad frente a modelos preentrenados con volumenes de datos realistas y demostrar el impacto del tamano del corpus (819.200 tokens).
- Pruebas de integracion de ONNX Runtime: el export cuantizado de 148 MB permite validar pipelines de inferencia ONNX en entornos con recursos minimos antes de migrar a modelos mayores.
- Prototipado de interfaces de chat: la demo en Hugging Face Spaces y el formato User/Assistant permiten probar el cableado de una UI conversacional sin coste de inferencia relevante.
- Experimentos de SFT a pequena escala: con 1.024 ejemplos y una perdida que baja de 8,71 a 6,90, es un banco de pruebas economico para estudiar el efecto del ajuste supervisado en modelos minusculos.
- Auditoria de licencias y trazabilidad de datos: al documentar el manifiesto del corpus y el hash SHA-256 de Dolly 15k, resulta util como ejemplo de buenas practicas de procedencia de datos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Parametros | 116.534.784 |
| Tokens de preentrenamiento base | 819.200 |
| Perdida en test base | 6,327 |
| Perplejidad en test base | 559,698 |
| Precision top-1 en test base | 12,04 % |
| Precision top-5 en test base | 29,48 % |
| Tokens de evaluacion | 8.192 |
| Ejemplos de SFT | 1.024 |
| Perdida SFT antes | 8,708 |
| Perdida SFT despues | 6,900 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en precision completa (fp32): aproximadamente 0,47 GB solo para pesos, mas estados de activacion y KV cache; en la practica cabe en cualquier GPU consumer con 4 GB o mas.
- VRAM para el export ONNX cuantizado: el artefacto ocupa 148 MB, por lo que la inferencia puede ejecutarse en CPU.
- GPU recomendadas: no se especifican; cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es sobradamente suficiente. Para entrenamiento desde cero, una unica GPU consumer basta dado el tamano.
- Cabe en GPU consumer: si, sin restricciones practicas.
- Opciones de despliegue: ONNX Runtime (via el export cuantizado), PyTorch con safetensors; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pratham-117M | 116,5 M | no disponible | Perplejidad 559,7 en test; respuestas incoherentes | CC BY-SA 3.0 | Hugging Face, ONNX, Space de demo |
| GPT-2 small | 124 M | 1.024 tokens | Perplejidad muy inferior; texto coherente a nivel de parrafo | MIT | Amplia, multiples formatos |
| GPT-2 medium | 355 M | 1.024 tokens | Superior a GPT-2 small | MIT | Amplia |
| DistilGPT-2 | 82 M | 1.024 tokens | Destilado de GPT-2; texto coherente | MIT | Amplia |

La comparacion con GPT-2 small es la mas directa por tamano, pero las diferencias de calidad son enormes: GPT-2 se entreno con decenas de miles de millones de tokens frente a los 819.200 de Pratham-117M. No se dispone de datos de benchmarks comparativos publicados para Pratham-117M mas alla de las metricas de su propia evaluacion.

## Limitaciones y advertencias

- Calidad muy baja: perplejidad de 559,7 y precision top-1 del 12,04 % en el propio conjunto de test del autor; las muestras publicadas son incoherentes y no responden a las preguntas planteadas.
- Riesgo elevado de alucinacion y de texto sin sentido; no apto para produccion ni para uso con usuarios finales.
- Corpus de preentrenamiento muy reducido (819.200 tokens), lo que explica en gran medida las limitaciones.
- Solo ingles; sin capacidades multilingues.
- Longitud de contexto no documentada, lo que impide planificar usos con ventanas largas.
- Licencia CC BY-SA 3.0: permite uso comercial, pero impone atribucion y compartir obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- El autor advierte explicitamente de que las respuestas pueden ser incoherentes o inexactas y recomienda leer `inference.py` antes de ejecutar codigo Python personalizado.
- Modelo marcado como experimental y con cero descargas y cero likes en el momento de la consulta; sin mantenimiento ni comunidad documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oncody/Pratham-117M
- Demo de chat en Spaces: https://huggingface.co/spaces/oncody/Pratham-117M-Chat
- Cuaderno de entrenamiento y documentacion: https://github.com/Rahulchaube1/-Pratham-117M-
- Dataset de SFT (Databricks Dolly 15k): https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
