# chadstthomas/Paraphase-2B

## Resumen

Paraphase-2B es un modelo de 2.516.756.480 parámetros (≈2,52 B) especializado en la reescritura de correos electrónicos en inglés para que suenen a prosa humana y no a texto generado por una IA. Lo publica el usuario chadstthomas como miembro pequeño de la familia Paraphase (junto a un Paraphase-4B) y es un fine-tune QLoRA del modelo base openbmb/MiniCPM5-2B, distribuido principalmente en formato GGUF para su ejecución local con llama.cpp.

El problema que aborda es concreto: borradores de correo con muletillas típicas de modelo ("Furthermore, it is important to note that..."), que el modelo reescribe en lenguaje llano conservando hechos, cifras, nombres y compromisos. Su propuesta de valor es la privacidad y el coste cero de infraestructura: funciona 100 % offline, sin API ni subida de datos, en dispositivos con 4-6 GB de RAM (móvil, portátil modesto, placa tipo Raspberry Pi), con pesos de 2,68 GB en Q8_0 y 1,56 GB en Q4_K_M.

Es relevante ahora por la combinación de tres factores: tamaño reducido para edge, licencia Apache-2.0 que permite uso comercial y un conjunto de métricas de evaluación publicadas por el autor (50 pares de correos, pruebas con el detector Pangram) que, aunque limitadas y autoinformadas, documentan explícitamente los fallos del modelo. La ventana de contexto práctica es de 2048 tokens, suficiente para un borrador individual pero no para documentos largos. El modelo solo soporta inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles internos no especificados; fine-tune QLoRA de openbmb/MiniCPM5-2B) |
| Parametros totales | 2.516.756.480 (≈2,52 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (valor recomendado por el autor con `-c 2048`); máximo nativo no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (2,68 GB) y Q4_K_M (1,56 GB); pesos safetensors en el repo |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF (librería declarada: llama.cpp) |
| Modelo base | openbmb/MiniCPM5-2B |
| Metodo de ajuste | QLoRA / LoRA sobre el modelo base |
| Tamaño del repositorio | 4,3 GB |
| Descargas / likes | 28 / 0 (a fecha de la información) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del transformer subyacente ni la composición del dataset de ajuste. Lo que sí se especifica es el procedimiento: un fine-tune QLoRA (adaptadores LoRA sobre cuantización de 4 bits) del modelo openbmb/MiniCPM5-2B, orientado a una única tarea de reescritura de estilo ("style transfer") sobre correo electrónico en inglés. No se documentan número de tokens de entrenamiento, mezcla del corpus, ni si hubo fases de RLHF o DPO; el autor tampoco publica los adaptadores LoRA por separado en la información disponible.

El diseño funcional se apoya en un prompt de sistema fijo que impone las restricciones de la tarea: conservar cada hecho, número, nombre y compromiso, usar lenguaje directo, evitar guiones largos (em dashes), mantener una longitud similar y devolver solo el correo reescrito. Una innovación operativa destacable no está en el modelo sino en el envoltorio de inferencia: el autor recomienda un "retry wrapper" (reenvío con remuestreo) porque la generación greedy es válida solo en 41 de 50 casos; con reintentos sube a 48 de 50. El modelo no requiere flag de "thinking". Existe también un prompt específico y un conjunto de pruebas para tool calling, con una tasa de éxito del 65 %.

## Capacidades

- Reescritura de texto en inglés con transferencia de estilo: convierte borradores con registro de IA en prosa directa y coloquial.
- Preservación de hechos: mantiene cifras, fechas, nombres y compromisos con una fidelidad numérica medida del 96,1 % (Q8_0 + retry) y 93,9 % (Q4_K_M greedy).
- Control de longitud: ratio de longitud de salida/entrada de 0,82 (greedy) y 0,95 (con retry), es decir, acorta ligeramente el original.
- Reducción de marcas de IA: 6,3 % de "AI tells" en la configuración Q8_0 + retry, el valor más bajo de la familia según el autor.
- Tool calling / function calling: soportado de forma parcial, con un 65 % de éxito en Q8_0 y 60 % en Q4_K_M.
- Ejecución 100 % local y offline: sin llamadas a API, sin telemetría ni subida de datos.
- Integración con endpoint compatible con OpenAI a través de `llama-server` (`/v1/chat/completions`).
- Capacidades multilingües: no disponibles; el modelo está entrenado y evaluado únicamente en inglés.
- No dispone de modo de razonamiento explícito, visión, audio ni generación de código como capacidades declaradas.

## Casos de uso

- Reescritura de correos internos en el puesto de trabajo: el modelo recibe el borrador y devuelve una versión en lenguaje llano conservando fechas y compromisos, con 2048 tokens de contexto suficientes para un correo típico.
- Entornos con requisitos estrictos de privacidad: al ejecutarse offline sobre `llama-server` en la propia máquina, el contenido del correo nunca sale del dispositivo, lo que encaja en sectores regulados que no permiten APIs externas.
- Procesamiento por lotes nocturno: con el retry wrapper descrito por el autor se pueden reescribir lotes de borradores en una máquina sin GPU, aceptando el coste de hasta dos pasadas por documento para alcanzar 48/50 de validez.
- Asistentes en movilidad o edge: con la cuantización Q4_K_M (1,56 GB) el modelo cabe en un móvil de 4 GB o en una placa tipo Raspberry Pi, habilitando reescritura sin conectividad.
- Integración en clientes de correo de escritorio: un plugin puede apuntar al endpoint local compatible con OpenAI y ofrecer un botón de "humanizar" sobre el texto seleccionado.
- Normalización de estilo en documentación y base de conocimiento: homogeneizar borradores generados por IA antes de publicarlos, usando las métricas de marcas de IA (6,3 %) como criterio de calidad interna.
- Filtro previo en pipelines editoriales: cribar textos sintéticos antes de la revisión humana, siempre con supervisión, dado que el autor no garantiza la evasión de detectores.
- Prototipado rápido de investigación sobre reescritura de estilo: modelo pequeño, licencia Apache-2.0 y métricas publicadas permiten reproducir la evaluación en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica una evaluación propia sobre "voice50" (50 pares de correos emparejados) y pruebas con el detector Pangram:

| Configuración | Válidos (de 50) | Marcas de IA | Fidelidad de hechos | Reutilización de copia | Ratio de longitud | Tool calls |
|---|---:|---:|---:|---:|---:|---:|
| 2B Q8_0, greedy | 41/50 | 2,4 % | 97,5 % | 0,301 | 0,82 | 65 % |
| 2B Q8_0 + retry | 48/50 | 6,3 % | 96,1 % | 0,294 | 0,95 | 65 % |
| 2B Q4_K_M, greedy | 41/50 | 7,3 % | 93,9 % | 0,219 | 0,77 | 60 % |

| Prueba Pangram | Resultado |
|---|---|
| Puerta de 12 textos de origen humano | 12/12 superados (base: 11/12; McNemar p = 1,0; mediana continua −0,213, p = 0,052). Descriptivo |
| 13 borradores marcados por el detector | 10/13 mejorados; mediana de `fraction_ai` −0,503 (IC 95 % [−0,588; 0,000]); 7 cruzaron por debajo de 0,5; 0 inversiones pass→fail; test de signos exacto p = 0,039 |
| Puerta preregistrada | Requería 11/13; no alcanzada (resultado "sugerente, no confirmado") |

El propio autor señala que el brazo principal del experimento (los 50 borradores de voice50) resultó inválido como control, porque solo 13 de los 50 fueron marcados por Pangram, es decir, los borradores eran demasiado fáciles. Los datos brutos están en la carpeta `pangram/` del repositorio.

## Requisitos de hardware

- RAM libre estimada por el autor (pesos + caché KV de 2048 tokens + overhead de runtime): ≈3,5 GB con Q8_0 y ≈2,3 GB con Q4_K_M.
- Dispositivos objetivo: móvil de 6 GB u portátil de 8 GB para Q8_0; móvil de 4 GB (ajustado) o portátil de 4 GB para Q4_K_M; en 4 GB conviene usar Q4 con `-c 1024`.
- VRAM en GPU: no publicada por el autor. Como referencia derivada del tamaño de los pesos (1,56-2,68 GB), cualquier GPU consumer con 4 GB o más de VRAM puede alojar el modelo completo; no hay datos de throughput ni latencia.
- GPU recomendadas: no disponibles en la información proporcionada; el autor no documenta ejecución en A100, H100 ni RTX 4090.
- Despliegue: `llama-server` de llama.cpp, con endpoint compatible con OpenAI en `/v1/chat/completions`. Otros motores (vLLM, TGI, Ollama) no se mencionan en la model card.
- Comando de referencia: `llama-server -m paraphase-2b-Q8_0.gguf -c 2048 --host 0.0.0.0 --port 8080`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño de pesos (Q8) | Válidos en voice50 | Marcas de IA | Fidelidad de hechos | Licencia |
|---|---|---:|---:|---:|---:|---:|---|
| Paraphase-2B (Q8 + retry) | ≈2,52 B | 2048 | 2,68 GB | 48/50 | 6,3 % | 96,1 % | Apache-2.0 |
| Paraphase-4B (Q8 + retry) | no disponible (4B nominal) | no disponible | 4,48 GB | 50/50 | 8,0 % | 97,0 % | no disponible |
| openbmb/MiniCPM5-2B (base) | ≈2,52 B | no disponible | no disponible | 11/12 en la puerta de origen humano | no disponible | no disponible | no disponible |

Frente al 4B de la misma familia, el 2B gana en tamaño (2,68 GB frente a 4,48 GB), necesita menos RAM (≈3,5 GB frente a ≈5,5 GB) y reduce las marcas de IA (6,3 % frente a 8,0 %), pero pierde en validez greedy (48/50 frente a 50/50) y en fidelidad de hechos (96,1 % frente a 97,0 %). Ambos empatan en tool calling (65 %). No se dispone de comparación con humanizadores comerciales ni con otros modelos pequeños de reescritura en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: el autor desaconseja explícitamente su uso con texto en otros idiomas.
- Ventana de contexto corta (2048 tokens): no apto para documentos largos, hilos completos ni reescritura de informes extensos.
- Validez greedy del 82 % (41/50): el modelo recae ocasionalmente en el hábito de recitar instrucciones heredado del modelo base; requiere el retry wrapper para alcanzar 48/50.
- Fidelidad de hechos no perfecta: un 3,9 % de pérdida en hechos numéricos con Q8_0 + retry y un 6,1 % con Q4_K_M greedy, un riesgo real si el correo contiene cifras contractuales o compromisos.
- La cuantización Q4_K_M degrada fidelidad (93,9 %) y tool calling (60 %) por debajo del umbral de calidad que el autor considera aceptable para publicación.
- No garantiza la evasión de detectores de IA: la puerta preregistrada de Pangram (11/13) no se alcanzó, con 10/13 y resultado calificado de "sugerente, no confirmado". Cualquier afirmación de evasión garantizada es incorrecta.
- Tool calling parcial (65 %): no es fiable como pieza central de un agente automatizado.
- Uso desaconsejado por el autor para consejo legal o médico y para envío desatendido de correos sin revisión humana.
- Evaluación autoinformada y de muestra pequeña (50 pares, 13 borradores marcados), sin benchmarks estándar ni validación externa; el repositorio tiene 28 descargas y 0 likes.
- Sesgos: no documentados por el autor; al ser un fine-tune de un modelo base no descrito en la ficha, se heredan los sesgos de su corpus de entrenamiento, que no se detalla.
- Licencia Apache-2.0: permite uso comercial y modificaciones, pero no exime de responsabilidad sobre el contenido generado ni sobre el cumplimiento normativo del despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chadstthomas/Paraphase-2B
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Variante mayor de la familia: https://huggingface.co/chadstthomas/Paraphase-4B
- Demo interactiva de comparación: https://huggingface.co/spaces/chadstthomas/paraphase-explorer
- Demo del 4B: https://huggingface.co/spaces/chadstthomas/paraphase-rewriter
- Datos brutos de las pruebas Pangram: https://huggingface.co/chadstthomas/Paraphase-2B/tree/main/pangram
- Resultados de búsqueda web: no se han encontrado enlaces técnicos relevantes (papers, blogs o repositorios) sobre este modelo; los resultados devueltos no guardan relación con el contenido de la ficha.
