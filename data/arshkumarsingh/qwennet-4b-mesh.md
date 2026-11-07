# arshkumarsingh/qwennet-4b-mesh

## Resumen

qwenNET-4B-mesh es un checkpoint de Qwen3.5-4B modificado por el usuario arshkumarsingh para incorporar circuitos deterministas directamente en los pesos del transformer. El modelo combina tres componentes: una CPU CHIP-8 exacta con BIOS de precisión arbitraria (hasta 24 dígitos), un dispositivo de red con almacén de ficheros versionado (128 ficheros × 63 versiones) y la red neuronal Qwen3.5-4B original. La idea central es que agentes construidos sobre este checkpoint pueden coordinarse sin llamadas a herramientas externas: escriben ficheros, los leen, se los envían entre sí, se despiertan mutuamente y solicitan ficheros mediante líneas de texto plano que un circuito interno ejecuta de forma determinista.

El modelo resuelve el problema de la fiabilidad en la coordinación multi-agente: en lugar de depender de que el modelo "decida" llamar a una herramienta, los comandos (`@send`, `@wake`, `@ask`, `@append`) son ejecutados por circuitos compilados en los pesos, con validación que reporta 7.237/7.237 tokens forzados como argmax y 25/25 sesiones de dispositivo exactas. Es relevante porque propone un enfoque de interpretabilidad mecanicista aplicada a la orquestación de agentes, aunque la propia model card reconoce que el juicio del Qwen3.5-4B subyacente sigue siendo el cuello de botella y que una repetición del checkpoint v5 falló la tarea de ecuación por auto-duda del modelo.

El checkpoint tiene 12.556.124.096 parámetros reales según safetensors (el padding de dimensiones residuales infla el recuento respecto a los 4B nominales), 52 capas y un repositorio de 25,1 GB. La licencia es Apache 2.0 y se distribuye en formato safetensors para transformers, sin necesidad de `trust_remote_code`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5-4B (`Qwen3_5ForCausalLM`) con 52 capas; capas 0-11: CPU CHIP-8 exacta con BIOS bignum; capas 12-19: dispositivo de malla (almacén de ficheros versionado, envíos, despertares, `@ask`, `@append`); capas 20-51: Qwen3.5-4B sin cambios salvo padding de ceros |
| Parametros totales | 12.556.124.096 (según safetensors; incluye padding de dimensiones residuales) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors; no se documentan cuantizaciones GGUF u otras) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura parte de un checkpoint estándar `Qwen3_5ForCausalLM` de 52 capas al que se han fusionado dos circuitos deterministas mediante una receta de composición general documentada en `composition-recipe.md`. Las técnicas clave son: dimensiones residuales disjuntas (el residual se ensancha a 4.864 dimensiones y cada matriz se rellena con ceros, de modo que cada circuito lee y escribe solo sus propias dimensiones); normas exactas mediante lastre (constantes grandes en cada token hacen que cada RMSNorm divida por una potencia de dos exactamente conocida, 2^37 para la CPU y 256 para el dispositivo, ambas restricciones simultáneamente en H = 64·76); compuertas de silencio (las compuertas de decaimiento y escritura de Gated-DeltaNet y las compuertas de salida de atención se fuerzan a 0 en los tokens que un circuito no debe ver); y una norma final compartida donde cada código de salida tiene sus propias dimensiones y ganancia, de forma que donde un circuito no fuerza nada el código es exactamente 0 y los logits son los de Qwen.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El modelo base Qwen3.5-4B se mantiene sin cambios salvo el padding de ceros, y el segundo modelo base referenciado es `divagr1925/Qwen3.5-4B-Qwenputer-CHIP8`, del que procede la CPU CHIP-8. La validación reportada incluye: 7.237/7.237 tokens forzados por el dispositivo son argmax en un forward plano por todas las capas (0 desviaciones, margen mínimo sobre Qwen de 104 logits, mediana 464); 5.922/5.922 a través del motor de decodificación; 25/25 sesiones exactas incluyendo `@ask`, `@append`, cierres forzados y mallas aleatorias; 6/6 operaciones de CPU exactas (productos hasta 24 dígitos, sumas con acarreos completos) y 392/392 posiciones de CPU en forward plano con margen mínimo 232; y comparación de texto contra el checkpoint de Qwenputer con KL media 3,2e-4, máxima 2,6e-3 y acuerdo top-1 de 139/139.

## Capacidades

- Generación de texto conversacional y tareas de escritura (tareas `story` y `translate` en la demo).
- Aritmética exacta de enteros grandes mediante la CPU CHIP-8 interna: productos y sumas hasta 24 dígitos, con resultados deterministas y verificables.
- Coordinación multi-agente sin llamadas a herramientas: los agentes escriben ficheros, los leen, se los envían (`@send`), se despiertan (`@wake`), se piden ficheros (`@ask`) y añaden contenido (`@append`) mediante líneas de texto plano ejecutadas por circuitos en los pesos.
- Almacén de ficheros versionado interno: 128 ficheros × 63 versiones.
- Ejecución de la CPU y del almacén de ficheros en una sola llamada `generate()` con caché estática y el registro de arranque de la BIOS como prefijo.
- Capacidades multilingües: no disponibles en la información proporcionada (el modelo base Qwen3.5-4B presumiblemente las hereda, pero no se documentan).
- Tool calling / function calling convencional: no documentado; la propuesta del modelo es precisamente prescindir de él mediante circuitos internos.

## Casos de uso

- Cálculo aritmético exacto en pipelines de agentes: el modelo puede resolver productos y sumas de enteros de hasta 24 dígitos con resultados deterministas, útil en escenarios donde la aproximación de un LLM es inaceptable (contabilidad, verificación de facturas, criptografía didáctica). La CPU interna garantiza exactitud donde el modelo base fallaría.
- Orquestación multi-agente con estado compartido: tres o más agentes pueden repartirse una tarea, escribir ficheros intermedios, enviárselos y despertarse mutuamente sin que el host interprete el contenido; el host solo copia las salidas del dispositivo entre agentes, actuando como cable.
- Reparto de tareas de escritura o traducción: las tareas `story` y `translate` de la demo muestran cómo dividir la generación entre tres agentes que colaboran mediante el almacén de ficheros versionado.
- Recuperación de ficheros entre agentes sin despertar al proveedor: `@ask` permite que el dispositivo de un agente sirva un fichero a otro sin que el modelo del proveedor se active, reduciendo coste de cómputo en flujos de intercambio de datos.
- Investigación en interpretabilidad mecanicista: el checkpoint sirve como banco de pruebas para estudiar cómo circuitos deterministas compilados en pesos conviven con la red neuronal, con trazas de validación reproducibles token a token.
- Demostración educativa de computación híbrida neural-determinista: la tarea `equation` ilustra cómo un transformer puede delegar aritmética exacta a circuitos internos y coordinar agentes, con transcripciones y evidencias públicas en el repositorio.
- Prototipado de sistemas de agentes sin infraestructura de tool calling: equipos que quieran evaluar coordinación multi-agente sin desplegar servidores de herramientas pueden usar el bucle de host incluido en `qwennet` (`MergedNode` y el hub).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta únicamente validaciones internas del circuito compilado:

| Comprobación | Resultado |
|---|---|
| Dispositivo en el modelo completo (forward plano, todas las capas) | 7.237 / 7.237 tokens forzados son argmax, 0 desviaciones; margen sobre Qwen mínimo 104, mediana 464 logits |
| Dispositivo a través del motor de decodificación (stepped y restaurado) | 5.922 / 5.922 |
| Dispositivo, todas las clases de sesión incl. `@ask` / `@append` / cierres forzados / mallas aleatorias | 25 / 25 sesiones exactas |
| CPU (productos hasta 24 dígitos, sumas con acarreos completos) | 6 / 6 exactas; posiciones de CPU en forward plano 392 / 392, margen mínimo 232 |
| Texto frente al checkpoint de Qwenputer | KL media 3,2e-4, máxima 2,6e-3; acuerdo top-1 139 / 139 |

## Requisitos de hardware

- VRAM estimada para inferencia: la demo oficial requiere una GPU CUDA con 40 GB o más (L40S, A100, H100); la primera ejecución descarga unos 23 GB de pesos.
- GPU recomendadas según la model card: L40S, A100, H100 (40 GB o más).
- Cabe en GPU de consumo: no según los requisitos declarados (40 GB o más); no se documentan versiones cuantizadas que redujeran el requisito.
- Alternativa sin GPU local: ejecución en Modal con una L40S, con un coste estimado de 0,30–0,60 USD por tarea en la cuenta del usuario, mediante `modal_demo.py`.
- Opciones de despliegue: transformers con `generate()` codicioso (con caché estática y el registro de arranque de la BIOS como prefijo) para CPU y almacén de ficheros en una sola llamada; el bucle de host del paquete `qwennet` (`MergedNode` y el hub) para uso multi-agente. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la tarea `equation` con tres agentes en una L40S tardó 365 s en una ejecución en vivo (build v4). No se documentan cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Capacidades diferenciales | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwenNET-4B-mesh | 12.556.124.096 (con padding) | No disponible | CPU CHIP-8 exacta, malla multi-agente con ficheros versionados, circuitos deterministas en pesos | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen3.5-4B | 4B nominales | No disponible | Modelo base conversacional sin circuitos | No disponible en la información | Hugging Face |
| divagr1925/Qwen3.5-4B-Qwenputer-CHIP8 | 4B nominales | No disponible | CPU CHIP-8 compilada, sin dispositivo de malla | No disponible en la información | Hugging Face |

La comparativa se limita a los modelos referenciados en la información disponible; no se dispone de datos de benchmarks comparativos entre ellos.

## Limitaciones y advertencias

- El juicio del Qwen3.5-4B subyacente es el cuello de botella, no los circuitos: los agentes a veces usan mal un comando (por ejemplo, escribiendo `@append` seguido de líneas planas sin bloque de fichero, o terminando una línea `@read` con el fin de turno).
- Una repetición del checkpoint v5 falló la tarea `equation`: B dudó de su resultado exacto ("Wait, that's not right. Let me be more careful"), escribió una expresión aproximada que activó el evaluador completo de expresiones de la CPU (traza de 4.679 tokens) y agotó su presupuesto de turno antes de enviar. Los circuitos se comportaron correctamente; el modelo de 4B a bajo esfuerzo no completó la tarea de forma fiable.
- En la ejecución `fetch`, A a bajo esfuerzo de razonamiento nunca llegó a su `@append`.
- Riesgo de alucinación: no documentado específicamente, pero el modelo base Qwen3.5-4B conserva su comportamiento generativo; la model card solo valida que los circuitos fuerzan tokens exactos, no la calidad del texto libre.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no se documentan.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B y el checkpoint Qwenputer tienen sus propias condiciones, no detalladas en la información.
- Para uso multi-agente se necesita el bucle de host del paquete `qwennet`; el `generate()` plano solo cubre CPU y almacén de ficheros en una llamada.
- El recuento de parámetros real (12.556 millones) no debe interpretarse como capacidad del modelo: buena parte corresponde al padding de dimensiones residuales y a los circuitos compilados.
- El repositorio tiene 0 descargas y 0 likes, y el modelo se creó y actualizó el mismo día (2026-11-06), por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arshkumarsingh/qwennet-4b-mesh
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Segundo modelo base (Qwenputer CHIP8): https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer-CHIP8
- Repositorio Qwenputer: https://github.com/divagr18/qwenputer
- Repositorio qwenFS: https://github.com/vixhal-baraiya/qwenFS
- Receta de composición: https://huggingface.co/arshkumarsingh/qwennet-4b-mesh/blob/main/composition-recipe.md
- Demo en Modal: https://huggingface.co/arshkumarsingh/qwennet-4b-mesh/blob/main/modal_demo.py
- Evidencias de validación: https://huggingface.co/arshkumarsingh/qwennet-4b-mesh/tree/main/evidence
- Paquete `qwennet` (rueda): https://huggingface.co/arshkumarsingh/qwennet-4b-mesh/resolve/main/qwennet-0.2.1-py3-none-any.whl
- Paper referenciado en los tags (arXiv:2610.13928): https://arxiv.org/abs/2610.13928
