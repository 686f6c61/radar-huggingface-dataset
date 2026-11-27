# Muesli-HQ/lfm3-1.7b-muesli-cleanup-v14-mlx-8bit

## Resumen

`lfm3-1.7b-muesli-cleanup-v14-mlx-8bit` es un ajuste fino del modelo LiquidAI/LFM3-1.7B orientado a una tarea muy concreta: la limpieza de transcripciones de dictado por voz. Lo publica Muesli-HQ, el equipo de una aplicacion de dictado para macOS, y su funcion es recibir la salida cruda de un sistema de reconocimiento de voz (opcionalmente acompanada de contexto de pantalla) y devolver el texto corregido: arregla errores evidentes de reconocimiento, elimina muletillas, aplica autocorrecciones del tipo "no, espera" o "borra eso", convierte enumeraciones dictadas en listas y respeta el estilo de puntuacion de la aplicacion de destino. Si el texto ya es correcto, lo devuelve sin cambios.

El modelo no es un reconocedor de voz: es un postprocesador de texto que se ejecuta en el dispositivo (on-device) dentro de la app. Esta distribuido en formato MLX cuantizado a 8 bits con grupo de 64, lo que reduce el peso del repositorio a 1,9 GB y permite ejecutarlo en hardware Apple Silicon sin depender de la nube.

Es relevante porque demuestra un patron habitual en el ecosistema open source: tomar un modelo base pequeno (1.700 millones de parametros) y especializarlo con LoRA para una tarea acotada, con un prompt fijo y restricciones estrictas de no parafrasear. El resultado es un componente de infraestructura mas que un modelo de proposito general, con latencias por debajo del segundo en un Apple M5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (LFM3 de LiquidAI, con proyecciones de atencion, MLP y convolucion corta), ajustado con LoRA |
| Parametros totales | 1.728.801.536 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma explicita; el prompt limita la salida a 1024 tokens nuevos y el bloque de contexto de pantalla se recorta a 1200 caracteres |
| Tipos de cuantizacion | 8 bits, group size 64 (formato MLX) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | LFM Open License v1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`), tamano del repo 1,9 GB |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer denso de 1.700 millones de parametros. Sobre la base en bf16 se aplico un ajuste fino con LoRA de rango 16 (transformers 5.20 y PEFT 0.21) que cubre las proyecciones de atencion, las capas MLP y las proyecciones de convolucion corta. El entrenamiento fue de una sola epoca (9.815 pasos) con la perdida calculada unicamente sobre la respuesta, y los pesos LoRA se fusionaron despues en los pesos base. La perdida de evaluacion final fue de 0,115.

Los datos de entrenamiento, denominados blend-v14, constan de 157.037 pares de limpieza que cubren correo electronico, chat, documentos, prompts para agentes de IA, codigo, hojas de calculo y presentaciones, cajas de busqueda y dictados largos; aproximadamente el 24 % de los pares incluyen contexto de pantalla. Los pares fueron generados por modelos abiertos sobre Fireworks. Respecto a la version anterior (blend-v12), esta mezcla anade errores de reconocimiento y habitos de habla realistas, corrige unos 15.000 objetivos de formato a una unica especificacion escrita (las senales habladas siempre generan lista; en notas y documentos solo se generan listas con 3 o mas elementos; se conservan los encabezados dictados; solo se numera cuando se cuenta explicitamente), descarta filas que fallaron una auditoria y anade 2.759 filas de formato verificadas por Claude.

Una innovacion destacable es la ingenieria del prompt: el modelo espera un unico turno de usuario sin mensaje de sistema, decodificacion codiciosa (temperatura 0, `top_k=1`, sin penalizacion por repeticion) y un bloque `` vacio al inicio de la respuesta del asistente, lo que fuerza al modelo a no generar razonamiento intermedio. El prompt debe construirse manualmente y coincidir exactamente con el de entrenamiento.

## Capacidades

- Limpieza de transcripciones de voz: corrige errores evidentes de reconocimiento, elimina muletillas ("um", "uh", "like") y aplica autocorrecciones dictadas ("scratch that").
- Formateo de listas: convierte elementos dictados o claramente enumerados en listas numeradas o con vinetas segun la especificacion de formato.
- Uso de contexto de pantalla: acepta un bloque `<APP-CONTEXT>` con aplicacion enfocada, documento, URL, texto seleccionado u OCR para resolver nombres, siglas y errores de transcripcion, sin copiar ese contexto a la salida.
- Adaptacion al estilo de puntuacion de la aplicacion de destino.
- Preservacion del texto original: devuelve la entrada sin cambios cuando ya es correcta, sin parafrasear ni reescribir.
- Generacion de texto conversacional (pipeline `text-generation`), aunque el ajuste esta especializado en la tarea de limpieza.
- No soporta tool calling, function calling, agentes multi-paso, vision ni audio; es exclusivamente texto a texto en ingles.

## Casos de uso

- Dictado en macOS dentro de la app Muesli: el modelo recibe la salida cruda del reconocedor de voz y devuelve el texto limpio listo para pegar, con una latencia mediana de 0,48 s en un Apple M5 con unas 535 tokens de prompt.
- Redaccion de correo por voz: al disponer de contexto de la aplicacion enfocada, puede resolver nombres propios y siglas mal transcritos y aplicar el estilo de puntuacion del cliente de correo, manteniendo intacta la formulacion original del hablante.
- Notas y documentos con enumeraciones: convierte dictados del tipo "primero, segundo, tercero" en listas con vinetas o numeradas cuando la especificacion de formato lo exige, y conserva los encabezados dictados.
- Prompts para agentes de IA dictados: limpia instrucciones dictadas para herramientas de IA, un dominio incluido explicitamente en el conjunto blend-v14, sin anadir contenido ni reescribir la intencion.
- Entrada de codigo y cajas de busqueda: corrige errores de reconocimiento en terminos tecnicos y acronimos usando el contexto de pantalla (por ejemplo, el texto OCR del editor o el documento abierto).
- Transcripcion de reuniones y dictados largos: procesa transcripciones extensas y aplica autocorrecciones ("no, espera", "borra eso") para producir un texto final coherente sin parafrasear.
- Integracion en pipelines de postprocesado de ASR: cualquier sistema de reconocimiento de voz en ingles puede usar el modelo como etapa de limpieza siempre que respete el formato de prompt exacto y aplique la guarda recomendada de pegar la transcripcion cruda si la salida esta vacia o supera 3 veces la longitud de la entrada.

## Benchmarks y rendimiento

Resultados publicados por el autor: tasa de error de palabra (WER) frente a la limpieza de referencia y coincidencia exacta (%), una peticion a la vez.

| Conjunto de evaluacion | WER / exact match |
|---|---|
| Contexto de pantalla (400) | 8,01 / 53,8 |
| Dictado simple (512) | 3,00 / 75,4 |
| Categorias nuevas A (309) | 2,54 / 36,6 |
| Categorias nuevas B (284) | 2,61 / 42,3 |
| Realismo (310) | 2,57 / 38,1 |
| Formato (180) | 1,49 / 24,4 |

Los conjuntos de prueba estan separados del entrenamiento, fueron escritos por modelos abiertos y filtrados por un juez automatico; el conjunto de formato lo escribio Kimi K3 y cada fila fue verificada por Claude. No son dictados reales de usuarios. El conjunto de dictado simple usa convenciones de lista antiguas que blend-v14 corrige, por lo que los modelos v14 puntuan peor en el que en lo que piden las reglas de formato actuales.

Rendimiento en un Apple M5 con unas 535 tokens de prompt: mediana de 0,48 s, p90 de 0,67 s, 0,56 s tras 30 s de inactividad; prefill de aproximadamente 1.580 tok/s y decodificacion de aproximadamente 48 tok/s.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 1,9 GB en 8 bits (group size 64); la inferencia requiere del orden de 2 GB de memoria mas el overhead del runtime MLX.
- Hardware objetivo: Apple Silicon (el autor reporta mediciones en un Apple M5). No hay datos publicados para GPU NVIDIA ni para CPU x86.
- Cabe en GPU de consumo solo a traves del ecosistema Apple; no se proporcionan pesos GGUF ni versiones para llama.cpp u Ollama.
- Despliegue: libreria `mlx` en Python (el modelo se convirtio con mlx-lm PR #2016, que aun no esta en una version publicada) y en Swift mediante mlx-swift-lm `main` a partir del commit `c48e55e9` (necesita mlx-swift 0.33). El tokenizer requiere huggingface/swift-transformers#397 para tokenizar igual que HF.
- Latencia y throughput: mediana 0,48 s por peticion, prefill ~1.580 tok/s y decode ~48 tok/s en Apple M5 con ~535 tokens de prompt.
- No hay soporte publicado para vLLM, TGI ni otras plataformas de servicio.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos de limpieza de dictado en la informacion proporcionada. La comparacion se limita a los parametros y la disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| lfm3-1.7b-muesli-cleanup-v14-mlx-8bit | 1.728.801.536 | No disponible | LFM Open License v1.0 | MLX 8-bit | Especializado en limpieza de dictado en ingles; solo Apple Silicon |
| LiquidAI/LFM3-1.7B (base) | 1.700 millones (aprox.) | No disponible | LFM Open License v1.0 | safetensors | Modelo generalista; no incluye el ajuste de limpieza ni el formato MLX |
| Alternativas de limpieza de dictado | No disponible | No disponible | No disponible | No disponible | No se han identificado en la informacion disponible |

## Limitaciones y advertencias

- Solo ingles: no soporta otros idiomas, incluido el castellano.
- No es un reconocedor de voz: unicamente limpia texto ya transcrito.
- El prompt debe coincidir exactamente con el de entrenamiento (un turno de usuario, sin mensaje de sistema, decodificacion codiciosa, bloque `` vacio y parada en `<|im_end|>`); cualquier desviacion puede degradar la calidad.
- Riesgo de alucinacion o de anadir contenido: el propio prompt lo prohibe, pero el autor recomienda una guarda en la aplicacion: si la salida esta vacia o supera 3 veces la longitud de la entrada, pegar la transcripcion cruda.
- Los conjuntos de evaluacion no son dictados reales de usuarios, por lo que el rendimiento en produccion puede diferir.
- Licencia LFM Open License v1.0: el uso comercial es gratuito solo para organizaciones con ingresos anuales inferiores a 10 millones de USD. Es una version modificada de LFM3-1.7B (ajuste LoRA fusionado y convertido a MLX 8-bit).
- Dependencias de runtime no publicadas: tanto mlx-lm como mlx-swift requieren versiones de `main` no etiquetadas, lo que complica la reproducibilidad y el mantenimiento en produccion.
- Sin soporte de tool calling, agentes, vision ni audio; su ambito es estrictamente la limpieza de texto.
- No hay datos publicados sobre sesgos especificos del ajuste; al heredar la base LFM3-1.7B, puede reproducir sesgos del corpus original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muesli-HQ/lfm3-1.7b-muesli-cleanup-v14-mlx-8bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE`
- mlx-swift-lm, soporte LFM3 (PR #750, commit `c48e55e9`): https://github.com/ml-explore/mlx-swift-lm/pull/750
- mlx-lm, PR #2016 (conversion del modelo): https://github.com/ml-explore/mlx-lm/pull/2016
- swift-transformers, PR #397 (tokenizacion BPE `ignore_merges`): https://github.com/huggingface/swift-transformers/pull/397
