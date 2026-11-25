# kabcnd/Kenzan-Yoku-3.8B-PinGrid-GGUF

## Resumen

Kenzan-Yoku-3.8B-PinGrid es un modelo especializado en la generación de comandos de Windows PowerShell, desarrollado por el usuario kabcnd y publicado en Hugging Face bajo licencia MIT. Se construye sobre `microsoft/Phi-4-mini-instruct` (3.836.021.856 parámetros reales según safetensors) mediante un proceso de ajuste fino con QAT (quantization-aware training) ternario, alineamiento DPO y una cuantización mixta propietaria denominada PinGrid. El modelo solo distribuye pesos en formato GGUF, listos para llama.cpp.

El modelo resuelve un problema muy concreto: traducir peticiones en ruso o inglés a comandos de PowerShell 5.1 y 7.4 que respeten las restricciones del entorno Windows descrito por el usuario (versión de PowerShell, privilegios de administrador, política de ejecución, modo de lenguaje, repositorio aprobado y herramientas disponibles). Devuelve siempre un contrato JSON estricto con los tipos `command`, `refuse` o `unsure`, lo que facilita su integración en pipelines automatizados.

Su relevancia actual reside en la combinación de un tamaño reducido (3.8B) con una variante ternaria de 1.58 bits (`TQ1_0`) de solo 1.05 GiB, pensada para ejecución en CPU o dispositivos de borde. El autor reporta una velocidad de generación de 43.54 t/s en 4 hilos de CPU, lo que lo hace viable en entornos sin GPU. La especialización vertical (CLI de Windows) frente a los modelos generalistas es su principal diferenciador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Phi-4-mini-instruct) |
| Parametros totales | 3.836.021.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q3_K, Q3_K_S, TQ1_0 (ternario 1.58-bit) |
| Idiomas soportados | en, ru |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors no se distribuye en este repo |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/Phi-4-mini-instruct`, un transformer decoder-only de 3.84B parámetros. Sobre esa base, el autor aplica un proceso de ajuste fino orientado a la generación de comandos PowerShell, con verificación mediante el parser AST nativo de Windows PowerShell y una lista blanca de 2.857 cmdlets. El alineamiento se completa con DPO (Direct Preference Optimization) balanceado, según se describe en la model card.

La innovación técnica principal es PinGrid, una estrategia de cuantización mixta que combina capas en K-quants (Q4_K, Q6_K) para embeddings y bloques críticos, y capas ternarias `TQ1_0` para el resto. La variante ternaria se entrena con STE-QAT alineado a bloques de 256 y destilación KL Top-16 desde `kabcnd/Kenzan-Yoku-3.8B-DPO-v2-BF16`, con pesos "horneados" exactamente en `{-alpha, 0, +alpha}`. El autor reporta una esparsidad de trits nulos del 31.2% y una pérdida de conversión cercana al 0% al aplicar `llama-quantize TQ1_0`. Los detalles sobre número de tokens de entrenamiento y composición exacta del dataset no están disponibles en la información proporcionada.

## Capacidades

- Generación de comandos de Windows PowerShell 5.1 y 7.4 con cumplimiento estricto de restricciones del entorno (`ps`, `admin`, `policy`, `lang`, `repo`).
- Detección de violaciones de sintaxis específicas de PowerShell 5.1 (prohibición de `&&`, `||`, `?:`, `??`, `-AsHashtable`).
- Contrato JSON determinista con tres tipos de respuesta: `command`, `refuse` y `unsure`.
- Capacidad de rechazo controlado (`refuse`) ante peticiones inseguras o fuera de política.
- Capacidad de expresar incertidumbre (`unsure`) cuando la petición es ambigua.
- Soporte bilingüe ruso-inglés, tanto en la petición como en la explicación devuelta.
- Conocimiento de reglas de firma Authenticode, JEA/RBAC, PSRepository y WinForms/WPF.
- No se documenta soporte de tool calling genérico, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente CLI para administradores de sistemas: el modelo traduce instrucciones en lenguaje natural a un único comando PowerShell listo para ejecutar, respetando la versión de PowerShell y la política de ejecución del host.
- Automatización de tareas de mantenimiento en Windows: generación de comandos para gestión de ficheros, procesos, servicios y registro, con validación AST previa a la ejecución en pipelines de CI/CD.
- Generación de scripts compatibles con PowerShell 5.1: útil en flotas empresariales donde no se puede actualizar a 7.x, ya que el modelo evita operadores no soportados y reporta cero violaciones de sintaxis en los benchmarks.
- Filtrado y moderación de peticiones: el tipo `refuse` permite descartar solicitudes peligrosas antes de llegar a un ejecutor real, con una tasa reportada del 96.8% en Q4_K_M.
- Despliegue en entornos de borde o sin GPU: la variante `TQ1_0` de 1.05 GiB permite ejecutar el modelo en CPU con 4 hilos a 43.54 t/s, adecuado para portátiles y servidores modestos.
- Soporte bilingüe en helpdesk técnico: atención a usuarios rusohablantes e anglohablantes que necesitan comandos de Windows, con explicación en el idioma de la petición.
- Integración en herramientas de gestión de configuración: el contrato JSON estricto permite parsear la salida sin heurísticas y decidir si ejecutar, pedir aclaración o rechazar.

## Benchmarks y rendimiento

Evaluación sobre `hoku_test_v2_clean.jsonl` (378 casos RU+EN: 220 command, 93 refuse, 65 unsure), con parser AST nativo y lista blanca de 2.857 cmdlets, decodificación greedy y `repeat_penalty=1.05`:

| Metrica | Q4_K_M-M6 (2.18 GiB) | TQ1_0 (1.05 GiB, 1.58-bit) |
|---|---|---|
| JSON valido | 378/378 (100.0%) | 378/378 (100.0%) |
| AST estricto Windows PS | 177/186 (95.16%) | 149/156 (95.51%) |
| Violaciones sintaxis PS 5.1 | 0 | 0 |
| Precision de tipo global | 337/378 (89.15%) | 294/378 (77.78%) |
| — command | 184/220 (83.6%) | 156/220 (70.9%) |
| — refuse | 90/93 (96.8%) | 73/93 (78.5%) |
| — unsure | 63/65 (96.9%) | 65/65 (100.0%) |
| Coincidencia de cmdlet principal | 157/220 (71.36%) | 129/220 (58.64%) |

Evaluación adicional sobre `hoku_test_v1.jsonl` (493 casos) para Q4_K_M-M6: `valid_json = 97.57%`, `type_acc = 96.35%` (refuse 100.0%, unsure 95.0%), `cmdlet_ref = 82.34%`, `ps51_violations = 0`.

Rendimiento en CPU (`-ngl 0 -t 4`):

| Metrica | Q3_K_S | TQ1_0 |
|---|---|---|
| Prompt processing (pp128) | 155.35 t/s | 142.47 t/s |
| Generación (tg64) | 27.49 t/s | 43.54 t/s |

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; todas las variantes están pensadas para CPU. En GPU, el modelo completo en Q4_K_M ocupa 2.18 GiB de memoria.
- GPU recomendadas: cualquier GPU con al menos 2-3 GiB de VRAM puede alojar las variantes K-quant; no se documentan requisitos específicos para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU con 3 GiB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). La variante TQ1_0 de 1.05 GiB cabe incluso en iGPU y dispositivos de borde.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), `llama-quantize` para generar variantes, y cualquier frontend compatible con GGUF (Ollama, LM Studio, etc.). El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo TGI, aunque no se detalla.
- Latencia y throughput: en 4 hilos de CPU, TQ1_0 alcanza 43.54 t/s en generación y 142.47 t/s en prompt processing; Q3_K_S alcanza 27.49 t/s y 155.35 t/s respectivamente. No se reportan cifras en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Kenzan-Yoku-3.8B-PinGrid | 3.84B | no disponible | PowerShell 5.1/7.4 RU+EN | MIT | GGUF |
| microsoft/Phi-4-mini-instruct | 3.84B | no disponible | Generalista | MIT | safetensors, GGUF |
| Modelos generalistas de 3-4B (p. ej. Llama 3.2 3B, Qwen2.5 3B) | ~3-4B | 128K aprox. (según modelo) | Generalista | licencias variables | safetensors, GGUF |

La comparación directa con alternativas especializadas en PowerShell no está disponible en la información proporcionada. Frente a su modelo base, Kenzan-Yoku añade especialización vertical, contrato JSON determinista y una variante ternaria de muy bajo peso, a costa de perder capacidades generalistas y de reducir la precisión fuera del dominio CLI de Windows.

## Limitaciones y advertencias

- Modelo altamente especializado: fuera del dominio de comandos PowerShell para Windows, su rendimiento como modelo conversacional generalista no está evaluado y probablemente sea inferior al de su base.
- Solo distribuye pesos GGUF; no hay safetensors en este repositorio, lo que limita el reentrenamiento o el ajuste fino directo.
- La variante ternaria TQ1_0 presenta una precisión de tipo global del 77.78%, notablemente inferior al 89.15% de Q4_K_M; para producción con requisitos estrictos se recomienda la variante K-quant.
- Riesgo de alucinación de cmdlets o parámetros: aunque el autor reporta validación AST y lista blanca, el modelo puede generar comandos sintácticamente válidos pero semánticamente incorrectos o peligrosos. Se recomienda validación y sandbox antes de ejecutar.
- Idiomas limitados a inglés y ruso; no se documenta soporte de castellano ni de otros idiomas.
- La longitud de contexto no se especifica en la información disponible; conviene consultar la model card del modelo base para planificar prompts largos.
- Sesgos conocidos: no se documentan sesgos específicos más allá de los heredados del modelo base y del corpus de entrenamiento.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la seguridad de los comandos generados; la responsabilidad de validación recae en el integrador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/kabcnd/Kenzan-Yoku-3.8B-PinGrid-GGUF
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Modelo de destilación referenciado: https://huggingface.co/kabcnd/Kenzan-Yoku-3.8B-DPO-v2-BF16
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
- Documentación de PowerShell (referencia de sintaxis y AST): https://learn.microsoft.com/powershell/
