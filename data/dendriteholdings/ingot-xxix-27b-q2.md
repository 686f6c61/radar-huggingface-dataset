# dendriteholdings/Ingot-XXIX-27B-Q2

## Resumen
Ingot-XXIX-27B-Q2 es una cuantización ternaria de 27B parámetros derivada de Ternary Bonsai 2 27B de Prism ML, publicada por dendriteholdings como espejo de una submission ganadora en Ingot, una subnet de Bittensor en la que los mineros comprimen un modelo profesor fijo y el validador premia la copia que más se le aproxima. El modelo parte de los pesos ternarios de Bonsai 2 y aplica un ajuste fino ligero (menos del 0,01% de los códigos ternarios modificados) para acercar la distribución de salida a Qwen3.8-27B, el profesor de referencia.

Se distribuye exclusivamente en formato GGUF con dos variantes que contienen exactamente los mismos pesos ternarios: una a 1,75 bits por peso (5,95 GB) y otra en contenedor de 2 bits (7,21 GB). Con 26.895.998.464 parámetros totales y 13,2 GB de repositorio, el interés práctico reside en que permite ejecutar un modelo de escala 27B en hardware de consumo y en GPUs de servidor con un coste de VRAM muy inferior al de una cuantización Q4 tradicional.

La relevancia actual es doble: por un lado, demuestra la viabilidad de la cuantización ternaria extrema con pérdida de calidad medida (KL de 0,07262 frente al profesor BF16); por otro, expone un ecosistema de inferencia específico, ya que requiere un fork de llama.cpp (Dendrite/PrismML) que implementa la rotación de Hadamard y la actualización de estado de atención lineal propias de esta familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal y rotación de Hadamard (familia Ternary Bonsai 2); pesos ternarios |
| Parametros totales | 26.895.998.464 (aproximadamente 27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria: PTQ1_0 a 1,75 bits por peso y PQ2_0 a 2,125 bits por peso (mismos pesos, distinto contenedor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); existe un pack MLX de 2 bits en otro repositorio |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura de Ternary Bonsai 2 27B de Prism ML: un transformer con atención lineal y una rotación de Hadamard aplicada en el pipeline de inferencia, con pesos almacenados en representación ternaria (códigos más escala fp16 por bloque de 128 pesos). El proceso de Ingot no entrena desde cero ni destila de forma convencional: el minero parte de los códigos ternarios del profesor Bonsai 2, modifica menos del 0,01% de ellos y reajusta el resto de pesos para minimizar la divergencia respecto a Qwen3.8-27B. La selección se hizo por KL(profesor ‖ modelo) sobre las distribuciones de siguiente token, promediada sobre las muestras de evaluación.

La innovación técnica relevante no está en el entrenamiento sino en el empaquetado y la inferencia. El fichero PTQ1_0 es un reempaquetado sin pérdida del fichero del minero: cada bloque de 128 pesos conserva sus códigos y su escala fp16, y cada peso decodifica al mismo valor. El fichero PQ2_0 contiene los mismos pesos ternarios en un contenedor de 2 bits que decodifica más rápido en GPU. Además, el autor publica un drafter de decodificación especulativa (DFlash 2) entrenado para esta familia, que acelera la generación aproximadamente 1,8x en modo greedy y 1,3-1,4x con sampling, a cambio de unos 6 GB adicionales de VRAM.

## Capacidades
- Generación de texto conversacional y de un solo turno, con pipeline declarado de text-generation.
- Razonamiento y respuesta a instrucciones heredados del profesor Qwen3.8-27B, aunque con la degradación propia de una cuantización ternaria.
- Entrada de imágenes opcional mediante el proyector multimodal de Ternary Bonsai 2 (mmproj en Q8_0 o BF16), aunque la calidad visual no está validada para estos pesos.
- Decodificación especulativa mediante el drafter DFlash 2, con verificación de tokens por el modelo principal.
- Compatibilidad con el servidor de llama.cpp en modo OpenAI-compatible (`--jinja`), lo que habilita tool calling y flujos de agente en la medida en que la plantilla del modelo base lo soporte.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso
- Despliegue de un modelo de 27B en una única GPU de consumo: con 7,21 GB para el fichero de 2 bits, cabe en tarjetas de 12-16 GB junto con el contexto y el drafter opcional, algo inviable con un Q4 equivalente.
- Servicio de chat en GPU de servidor con alta concurrencia: los 137 tok/s de decodificación y 3.865 tok/s de prompt en una RTX PRO 6000 Blackwell permiten atender varias sesiones conversacionales por tarjeta.
- Inferencia en Apple Silicon para desarrollo local: el fork de Dendrite con parche Metal alcanza 56,4 tok/s de decodificación en un Mac Studio M3 Ultra, suficiente para prototipado interactivo sin GPU dedicada.
- Investigación en cuantización extrema: el par de ficheros PTQ1_0 y PQ2_0, junto con la métrica KL publicada, sirve como referencia reproducible para estudiar la relación entre bits por peso y fidelidad al profesor.
- Evaluación de pipelines de Bittensor/Ingot: el modelo es un artefacto verificable de una ronda de la subnet, útil para reproducir la evaluación del validador y comparar submissions.
- Aceleración de prototipos con decodificación especulativa: integrando el drafter DFlash 2 se obtiene un aumento de 1,8x en greedy, adecuado para tareas de generación larga donde la latencia importa.
- Análisis de documentos con entrada visual: usando el mmproj de Bonsai 2 se puede experimentar con OCR o descripción de imágenes, aceptando que la calidad no está garantizada para estos pesos.

## Benchmarks y rendimiento
La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). El único dato de calidad es la divergencia KL frente al profesor BF16.

| Metrica | Valor |
|---|---|
| KL(profesor ‖ modelo), evaluacion ganadora | 0,07262 |
| KL(profesor ‖ modelo), rey anterior en la misma evaluacion | 0,07505 |

Rendimiento de inferencia medido con `llama-bench` (tg128 y pp512):

| Hardware | Fichero | Decode tok/s | Prompt tok/s |
|---|---|---|---|
| RTX PRO 6000 Blackwell 96 GB | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell 96 GB | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra, fork PrismML stock | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork PrismML stock | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, fork Dendrite (Metal) | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, fork Dendrite (Metal) | PTQ1_0 | 52,8 | 368 |

El autor cita además 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090, dato de PrismML no verificado de forma independiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Ingot-XXIX-27B-Q2 | 26,9B | no disponible | Ternaria 1,75-2,125 bpw | no disponible | Requiere fork de llama.cpp; KL 0,07262 |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27B | no disponible | Ternaria | no disponible | Modelo base; incluye torre de visión |
| dendriteholdings/Ingot-genesis-27B-Q2 | 27B | no disponible | Ternaria Q2 | no disponible | Mismo layout y tokenizer; predecesor en la serie Ingot |
| Cuantizacion Q4_K_M de un 27B denso | 27B | depende del base | 4-5 bpw (unos 16-17 GB) | depende del base | Mayor fidelidad, pero no cabe en GPUs de 12 GB |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias
- La cuantización ternaria introduce degradación medible: el KL de 0,07262 frente al profesor implica una divergencia no trivial en la distribución de siguiente token, perceptible en tareas de razonamiento largo o código.
- El ajuste del minero se orientó a minimizar KL, no a mejorar capacidades; no hay evidencia de que el modelo supere a su profesor en ninguna tarea.
- No funciona con llama.cpp estándar: requiere el fork de Dendrite en el commit `62c418c`, lo que complica el despliegue en plataformas gestionadas (vLLM, TGI, Ollama) que no incorporen ese parche.
- La licencia no está declarada en la información disponible, por lo que el uso comercial queda sin garantías jurídicas hasta verificarlo con el autor y con la licencia del modelo base.
- Idiomas soportados y longitud de contexto no documentados; no debe asumirse un contexto largo sin verificación empírica.
- La entrada multimodal usa un proyector diseñado para otro modelo (genesis) y el autor advierte que la calidad de imagen no está probada.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un derivado de Qwen3.8-27B, hereda los sesgos del profesor sin que se documente mitigación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- El drafter especulativo añade unos 6 GB de VRAM y su ganancia cae a 1,3-1,4x cuando se muestrea en lugar de decodificar en greedy.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXIX-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Proyector multimodal Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector multimodal BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
- Repositorio previo de la serie: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Drafter especulativo: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Pack MLX de 2 bits: https://huggingface.co/dendriteholdings/Ingot-XXIX-27B-MLX-2bit
- Fork de llama.cpp: https://github.com/DendriteLabs/llama.cpp
- Commit de referencia: https://github.com/DendriteLabs/llama.cpp/commit/62c418ccd7aefee37997e94c2d9fac1eed7fc89b
