# Reticule/DODI_Monkey

## Resumen

DODI_Monkey es un modelo publicado en HuggingFace por el usuario Reticule bajo licencia MIT y con el inglés como único idioma declarado. Los metadatos de la plataforma registran 0 descargas y 1 "me gusta", un tamaño de repositorio de 102,4 GB y fechas de creación y actualización del 18 de septiembre de 2026. No hay pipeline tag asignado, y la model card no contiene más información que las etiquetas de licencia (`mit`) e idioma (`en`): ni descripción, ni arquitectura, ni datos de entrenamiento.

No es posible determinar qué problema resuelve ni por qué sería relevante, porque no se ha publicado documentación técnica asociada. Las búsquedas web devuelven exclusivamente entradas de diccionario en francés para la palabra «réticule» —Larousse, Le Robert, Wiktionnaire, Wikipedia—, sin ninguna relación con el modelo, por lo que tampoco existe información externa verificable (paper, repositorio de código, demo o nota de prensa).

Esta ficha se limita, por tanto, a documentar los datos comprobables (licencia, idioma, tamaño del repositorio y métricas de la plataforma) y marca explícitamente como "no disponible" todo lo que el autor no ha publicado. Cualquier evaluación rigurosa exige descargar los pesos y caracterizarlos por cuenta propia antes de considerarlos para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (se desconoce si es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`), único idioma declarado |
| Licencia | MIT |
| Formato de pesos | no disponible |
| ID en HuggingFace | Reticule/DODI_Monkey |
| Autor | Reticule |
| Pipeline declarado | no disponible |
| Tamaño del repositorio | 102,4 GB |
| Descargas | 0 |
| "Me gusta" | 1 |
| Fecha de creación | 18 de septiembre de 2026 (según metadatos de la plataforma) |
| Última actualización | 18 de septiembre de 2026 (según metadatos de la plataforma) |

## Arquitectura y entrenamiento

No disponible. El autor no publica información sobre el tipo de arquitectura (transformer denso, MoE, híbrida, SSM u otra), el número de parámetros, el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de ajuste como SFT, RLHF o DPO. Tampoco hay detalle sobre innovaciones técnicas (atención lineal, decodificación especulativa, decodificación multi-token, etc.).

El único indicio indirecto es el tamaño del repositorio, 102,4 GB. Ese volumen es compatible con escenarios muy distintos: unos 51.000 millones de parámetros en fp16/bf16, unos 25.600 millones en fp32, unos 102.000 millones en int8 o unos 205.000 millones en int4, así como con un repositorio que contenga varias variantes de precisión, checkpoints intermedios o estados de optimizador. Sin conocer los formatos de fichero y el número de artefactos, este dato no permite estimar el tamaño real del modelo y debe tratarse únicamente como cota superior del conjunto descargable.

## Capacidades

- No hay ninguna capacidad documentada por el autor. La model card no describe tareas soportadas.
- No se puede confirmar siquiera que sea un modelo de lenguaje: no hay pipeline tag ni ejemplo de uso.
- El único dato funcional es el idioma declarado, inglés (`en`), lo que implica que no se declara soporte multilingüe.
- No hay evidencia de soporte de tool calling o function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso ni modo de pensamiento (thinking).
- No hay evidencia de capacidades de visión, audio, código o matemáticas.
- No se documentan modos de decodificación específicos, plantillas de prompt ni tokens especiales.

## Casos de uso

Advertencia previa: dado que no existe documentación de capacidades, los escenarios siguientes son hipotéticos y asumen que el modelo es un modelo de lenguaje de texto en inglés. Deben validarse empíricamente antes de cualquier uso real.

- Despliegue on-premise en inglés: si el modelo genera texto con calidad suficiente, la licencia MIT permite ejecutarlo en infraestructura propia, también con fines comerciales, sin coste de licencia ni cesión de datos a terceros. Es el escenario más plausible para un repositorio de este tamaño.
- Ajuste fino con LoRA o QLoRA sobre dominio propio: la licencia MIT permite crear y redistribuir derivados, de modo que el modelo podría servir como base para un ajuste sectorial (legal, sanitario, industrial) en inglés. Requiere construir un conjunto de validación propio, ya que no hay benchmarks publicados.
- Evaluación comparativa interna (baseline): puede utilizarse como punto de referencia en pruebas A/B frente a modelos ya desplegados, midiendo latencia, coste por token y precisión sobre tareas concretas de la organización.
- Auditoría de sesgos y robustez: al estar los pesos disponibles, un equipo de seguridad puede analizar comportamientos indeseados, tasas de alucinación y sensibilidad a prompts adversarios antes de plantear cualquier uso productivo.
- Investigación y reproducibilidad: permite experimentar con técnicas de cuantización, destilación o poda sobre un modelo sin restricciones de licencia, comparando después con alternativas abiertas de tamaño similar.
- Generación de código en pipelines de CI/CD: solo sería viable si el modelo demuestra competencia en código y soporta instrucciones estructuradas; ninguna de las dos cosas está documentada, por lo que este caso queda pendiente de verificación.
- Sistemas RAG sobre documentación técnica en inglés: la viabilidad depende por completo de la longitud de contexto, que se desconoce; sin ese dato no puede confirmarse que soporte fragmentos largos con múltiples pasajes recuperados.
- Atención al cliente automatizada en inglés: requeriría conversaciones multi-turno estables y una ventana de contexto suficiente. Al no estar documentada ni la ventana ni el comportamiento conversacional, este caso no puede recomendarse sin una evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, MT-Bench, LMSYS Arena ni de ningún otro conjunto de evaluación, ni resultados de arneses automáticos. El contador de descargas de la plataforma es 0, por lo que tampoco existen informes de terceros.

## Requisitos de hardware

- No es posible calcular la VRAM necesaria para este modelo concreto: se desconocen el número de parámetros y el formato de pesos.
- Como referencia general (no específica de este modelo) para un modelo denso con pesos en memoria, sin contar caché KV ni activaciones:
  
  | Parametros | Peso en fp16/bf16 | VRAM aproximada int8 | VRAM aproximada int4 | ¿Cabe en una GPU de consumo de 24 GB? |
  |---|---|---|---|---|
  | 7B | ~14 GB | ~7-8 GB | ~4-5 GB | Sí, incluso en fp16 |
  | 13B | ~26 GB | ~13-14 GB | ~7-8 GB | Sí, en int8 e int4 |
  | 34B | ~68 GB | ~34-36 GB | ~18-20 GB | Solo en int4 y con contexto corto |
  | 70B | ~140 GB | ~70-75 GB | ~35-40 GB | No; requiere 2x24 GB o descarga a CPU |
  | 120B | ~240 GB | ~120-125 GB | ~60-65 GB | No; requiere A100/H100 multigpu |

- A esas cifras hay que sumar la caché KV y las activaciones, que pueden añadir entre un 10 % y un 20 % según contexto y tamaño de lote.
- GPUs recomendadas en función del tamaño final: RTX 4090/5090 (24-32 GB) para modelos de hasta ~34B cuantizados, A100 40/80 GB y H100 80 GB para modelos de 70B o superiores, y configuraciones multigpu para repositorios que superen los 140 GB.
- Opciones de despliegue: vLLM y TGI para safetensors en GPU; llama.cpp y Ollama para GGUF en CPU/GPU híbrida; Transformers para prototipado. No se puede confirmar cuáles son aplicables porque se desconoce si el repositorio incluye safetensors, GGUF o ambos.
- Latencia y throughput estimados: no disponible. Ningún dato de tokens por segundo publicado.

## Comparativa con modelos similares

No disponible. No se puede seleccionar un grupo de modelos comparables porque se desconocen la categoría (lenguaje, visión, multimodal, embeddings), el número de parámetros, la longitud de contexto y el rendimiento. Sin esos tres primeros datos, cualquier comparación sería especulativa.

| Criterio de comparacion | Estado |
|---|---|
| Alternativas de la misma categoria | no disponible (categoria desconocida) |
| Parametros frente a alternativas | no disponible |
| Contexto frente a alternativas | no disponible |
| Rendimiento frente a alternativas | no disponible |
| Licencia frente a alternativas | MIT, permisiva, pero sin base comparable identificada |
| Disponibilidad | pesos publicados en HuggingFace; 0 descargas, 1 "me gusta" |

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre datos de entrenamiento, sesgos conocidos, usos previstos ni usos prohibidos.
- Se desconoce la tasa de alucinación y no existe ninguna evaluación. En ausencia de datos debe asumirse un riesgo alto hasta que se mida.
- Idiomas: solo inglés declarado. No se debe esperar un rendimiento aceptable en castellano ni en otras lenguas.
- Validación comunitaria prácticamente nula: 0 descargas y 1 "me gusta" implican que no hay informes independientes de fallos, sesgos ni comportamientos problemáticos.
- Licencia MIT: permite uso comercial, modificación y redistribución, con exención de garantías y sin responsabilidad del autor. Obliga a conservar el aviso de copyright y de licencia.
- Riesgo de licencia heredada: si DODI_Monkey es un ajuste fino, una fusión o una derivación de otro modelo (por ejemplo, de la familia Llama), la licencia de origen puede imponer condiciones adicionales que entrarían en conflicto con el MIT declarado. No hay información al respecto en la ficha.
- Seguridad al cargar pesos: si el repositorio contiene ficheros en formatos basados en `pickle` (`.bin`, `.pt`, `.ckpt`), existe riesgo de ejecución de código arbitrario. Se recomienda cargar únicamente safetensors y verificar el hash de los ficheros.
- Tamaño de 102,4 GB: la descarga, el almacenamiento y las transferencias tienen un coste relevante, y el despliegue exige hardware de gama alta o estrategias de cuantización y descarga a CPU.
- Fecha de publicación registrada (18 de septiembre de 2026) y ausencia de paper o repositorio de código: no hay forma de verificar el origen, la autoría real ni la procedencia de los datos.
- Sin pipeline tag ni plantilla de prompt, integrarlo en un sistema existente requiere ingeniería inversa del formato de entrada, con riesgo de degradar el rendimiento por un formateo incorrecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Reticule/DODI_Monkey
- Resultados de búsqueda web: ninguno relevante. Las consultas devuelven únicamente definiciones del sustantivo francés «réticule» (Larousse: https://www.larousse.fr/dictionnaires/francais/r%c3%a9ticule/68848; La langue française: https://www.lalanguefrancaise.com/dictionnaire/definition/reticule; Wiktionnaire: https://fr.wiktionary.org/wiki/r%C3%A9ticule; Wikipedia: https://fr.wikipedia.org/wiki/R%C3%A9ticule; Le Robert: https://dictionnaire.lerobert.com/definition/reticule), sin relación alguna con el modelo.
- Paper, repositorio de código, demo o blog del autor: no disponibles.
