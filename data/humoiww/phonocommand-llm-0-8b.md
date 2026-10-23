# humoiww/PhonoCommand-LLM-0.8B

# PhonoCommand-LLM-0.8B

## Resumen

PhonoCommand-LLM-0.8B es un adaptador LoRA (rango 16) más una cabeza de clasificación aprendida (`head.safetensors`) entrenados sobre el modelo base Qwen/Qwen3.5-0.8B. Lo publica el usuario humoiww en HuggingFace bajo licencia Apache-2.0. No es un modelo generativo ni un chat: en un único forward del backbone resuelve dos tareas acotadas de parseo de comandos, clasificar si una entrada es un comando válido (Y/N) y ordenar una lista de candidatos I/T/P proporcionada por el llamante.

El interés práctico está en su planteamiento como componente de enrutamiento lingüístico para aplicaciones de escritorio, con integración nativa en Windows documentada por el autor y un parser de referencia incluido. Frente a un LLM generativo, sustituye la decodificación autoregresiva por una pasada única con una cabeza de decisión, lo que reduce coste por inferencia y elimina variabilidad en la salida, a cambio de una tarea mucho más estrecha y de un máximo de 512 tokens de entrada.

El modelo cubre inglés, chino mandarín y cantonés, e incluye métricas de selección de checkpoint sobre enunciados no vistos (1651/1653), cantonés natural (318/320), mixto (1193/1200) y mixto reordenado (1195/1200). El propio autor advierte que son métricas de selección de checkpoint y no un test independiente en Windows ni en robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r16) sobre el backbone transformer Qwen/Qwen3.5-0.8B, más una cabeza de candidatos aprendida; los detalles internos del backbone no se especifican en la información disponible |
| Parametros totales | Aproximadamente 0,8 mil millones en el modelo base, más los pesos del adaptador LoRA r16 y de `head.safetensors` (no se publica el recuento exacto del adaptador) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Máximo 512 tokens |
| Tipos de cuantizacion | No disponible; el repositorio distribuye pesos en safetensors sin variantes cuantizadas |
| Idiomas soportados | en (inglés), zh (chino mandarín), yue (cantonés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors: pesos del adaptador LoRA (PEFT) y `head.safetensors`; el base se descarga por separado desde el repositorio oficial |

## Arquitectura y entrenamiento

La arquitectura es un backbone preentrenado Qwen/Qwen3.5-0.8B con un adaptador LoRA de rango 16 fusionado en una única pasada forward. Sobre la representación del backbone se aplica una cabeza de decisión entrenada que realiza dos operaciones simultáneas: clasificación binaria comando sí/no y ordenación de una lista de candidatos I/T/P suministrada por el llamante en un orden concreto. Una salida interna `None` sin resolver es distinta de la cadena de negocio `'none'`, un detalle semántico que el integrador debe respetar. No se añade system prompt adicional, ni correcciones de cadena, ni guarda de confianza sobre la salida.

No se publican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO; el autor indica explícitamente que no se incluyen filas de dataset ni audio humano en el repositorio. Sí se documentan detalles operativos: el checkpoint de exportación es el "Web default" actual y no el experimento separado step700; el paso de continuación step0 hereda el entrenamiento de step4400 y no está sin entrenar. Los pesos no cambian en la exportación, solo se normalizan metadatos de rutas privadas. La integración requiere fijar el commit exacto del base en `upstream_lock.json`, fusionar un único adaptador y cargar después la cabeza.

## Capacidades

- Clasificación binaria comando sí/no sobre una entrada de hasta 512 tokens en una sola pasada forward.
- Ordenación (ranking) de candidatos I/T/P suministrados por el llamante, respetando estrictamente el orden y la tokenización originales.
- Cobertura trilingüe: inglés, chino mandarín y cantonés, incluidos enunciados mixtos entre idiomas.
- Manejo de enunciados mixtos reordenados, según las métricas de selección publicadas.
- Integración nativa en Windows documentada en `WINDOWS_HANDOFF.txt`, con parser de referencia en `reference_code.zip`.
- Inferencia determinista de una sola pasada, sin decodificación autoregresiva ni sampling.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo "thinking".
- No procesa visión ni audio: el modelo no incluye audio humano, por lo que la transcripción debe venir de un ASR externo.
- No es un modelo de chat ni de generación de texto libre.

## Casos de uso

- Enrutamiento de comandos de voz en aplicaciones de escritorio Windows: el modelo recibe la transcripción del ASR y decide si es un comando válido, integrándose mediante el handoff nativo documentado por el autor.
- Desambiguación de transcripciones ASR: dado un conjunto de candidatos generados por el reconocedor, el modelo los reordena para escoger la interpretación más probable antes de ejecutar la acción.
- Asistentes con mezcla de idiomas: usuarios que alternan inglés, mandarín y cantonés en la misma frase pueden enviar el enunciado mixto sin normalización previa, aprovechando las métricas publicadas sobre conjunto mixto y mixto reordenado.
- Control de aplicaciones por voz en entornos con requisitos de privacidad: al ser un modelo de 0,8B con adaptador, puede ejecutarse en local sin enviar las transcripciones a un servicio externo.
- Filtro previo en pipelines de comandos: clasificar Y/N antes de invocar un LLM generativo más costoso evita llamadas innecesarias en entradas que no son comandos.
- Integración en sistemas embebidos o robótica con recursos limitados: la pasada única sobre 512 tokens y el tamaño reducido permiten desplegarlo donde un modelo generativo no cabría, aunque el autor advierte que la validación no se hizo en robot.
- Automatización de flujos internos con taxonomía propia: el autor recomienda sustituir las listas de candidatos del proyecto web original por la taxonomía real de la aplicación destino.

## Benchmarks y rendimiento

Métricas de selección de checkpoint publicadas por el autor (no son un test independiente en Windows ni en robot):

| Conjunto de evaluacion | Aciertos | Total | Porcentaje |
|---|---|---|---|
| Enunciados no vistos | 1651 | 1653 | 99,88 % |
| Cantonés natural | 318 | 320 | 99,38 % |
| Mixto | 1193 | 1200 | 99,42 % |
| Mixto reordenado | 1195 | 1200 | 99,58 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor no reclama una puntuación perfecta.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 0,8B del base, no medida publicada): en fp16 alrededor de 1,6 GB de pesos más adaptador y cabeza, con pico estimado de 2-3 GB para batch 1 y 512 tokens de contexto; en int8 en torno a 1 GB; en int4 en torno a 0,6 GB. Son estimaciones, no cifras oficiales.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente en la práctica; RTX 3060 12 GB, RTX 4060 y RTX 4090 quedan holgadas. A100 y H100 son innecesarias para este tamaño y solo tendrían sentido para servir muchos lotes en paralelo.
- Cabe en GPU consumer y también en inferencia por CPU, aunque no se publican cifras de latencia en CPU.
- Opciones de despliegue: PyTorch con PEFT, fusionando el adaptador sobre el base fijado en `upstream_lock.json` y cargando después `head.safetensors`; el parser de `reference_code.zip` debe apuntar explícitamente al directorio local del base. Para SDPA en modo eager se usa `warm_lengths=()`; las CUDA graphs son una optimización opcional.
- No es desplegable como modelo generativo en Ollama, llama.cpp, vLLM o TGI en su forma actual: la cabeza personalizada y la salida no autoregresiva requieren el código de referencia.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhonoCommand-LLM-0.8B | ~0,8B + LoRA r16 + cabeza | 512 tokens | Clasificación Y/N y ranking de candidatos | Apache-2.0 | Adaptador y cabeza en HuggingFace; base aparte |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | No disponible en la información proporcionada | Generación de texto general | No disponible en la información proporcionada | HuggingFace |
| Clasificadores de intenciones dedicados (p. ej. fine-tuning de encoders pequeños) | No disponible | No disponible | Clasificación de intención | No disponible | No disponible |

No se dispone en la información proporcionada de resultados comparativos frente a alternativas publicadas de la misma categoría (parseo de comandos o ranking de candidatos), por lo que la comparación cuantitativa figura como no disponible.

## Limitaciones y advertencias

- No es un modelo independiente de chat ni de generación: el autor prohíbe explícitamente su uso como modelo autoregresivo genérico o en Ollama.
- Ventana máxima de 512 tokens, insuficiente para diálogos largos o documentos extensos.
- No emite puntuaciones de confianza ni guardas de confianza; el integrador debe aportar su propia lógica de rechazo.
- El orden de los candidatos y la tokenización deben mantenerse intactos: cualquier reordenación o normalización previa altera el resultado.
- La distinción entre `None` interno sin resolver y la cadena de negocio `'none'` puede provocar errores silenciosos si el integrador los trata como equivalentes.
- Exige fijar el commit exacto del base indicado en `upstream_lock.json`; usar otra revisión invalida el adaptador.
- Cobertura lingüística limitada a inglés, chino mandarín y cantonés; el resto de idiomas no está soportado ni evaluado.
- Las métricas publicadas son de selección de checkpoint, no una validación independiente en Windows ni en robótica; no hay garantía de generalización al dominio destino.
- No se documentan sesgos conocidos, y el repositorio no incluye filas de dataset ni audio, lo que impide auditar la distribución de entrenamiento.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí riesgo de clasificación errónea en entradas fuera de distribución o con ruido de ASR.
- Licencia Apache-2.0: permite uso comercial y modificación, con obligación de conservar avisos de licencia y de atribución, y sin garantías por parte de los autores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/humoiww/PhonoCommand-LLM-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Documentación del algoritmo y del layout de tokens: https://huggingface.co/humoiww/PhonoCommand-LLM-0.8B/blob/main/ALGORITHM.txt
- Integración nativa en Windows: https://huggingface.co/humoiww/PhonoCommand-LLM-0.8B/blob/main/WINDOWS_HANDOFF.txt
- Código de referencia (parser y ejemplo): https://huggingface.co/humoiww/PhonoCommand-LLM-0.8B/blob/main/reference_code.zip
- Fijado del commit del base: https://huggingface.co/humoiww/PhonoCommand-LLM-0.8B/blob/main/upstream_lock.json
