# pTpTk/qwen1-72b-1layer

## Resumen

pTpTk/qwen1-72b-1layer es un artefacto de investigación publicado en HuggingFace por el usuario pTpTk que contiene una única capa decodificadora representativa extraída del modelo Qwen/Qwen-72B. No es un modelo entrenado ni un modelo utilizable para generar texto: la model card indica explícitamente que no se incluyen pesos, solo la configuración de dimensiones de texto, contexto/RoPE y precisión heredadas del modelo de origen, junto con un manifiesto de procedencia y un script de ejecución.

La capa incluida es la 0 (índice cero) del modelo fuente, con atención multi-cabeza (MHA) y FFN densa, sin PLE y sin módulos MTP retenidos. Se conserva la ventana de contexto publicada de 32.768 tokens (prompt más generación) y se advierte de que reducir la profundidad no amplía ese límite.

Su relevancia es instrumental: permite recorrer el camino de ejecución de un runtime (SGLang nativo con `--load-format dummy`) sobre una máquina CUDA sin materializar pesos, de modo que sirve para medir memoria de caché KV a 32.768 tokens, latencias de atención y compatibilidad de despliegue, además de para estudiar tipos de capa "frontera". El repositorio no declara licencia, idiomas ni pipeline, y registra 0 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decodificador; artefacto reducido a 1 capa representativa (capa 0 del modelo fuente) con atención MHA y FFN densa, sin PLE |
| Parámetros totales | no disponible (no se incluyen pesos) |
| Parámetros activos | no aplica (no es un modelo MoE; el artefacto no declara parámetros) |
| Longitud de contexto | 32.768 tokens (`seq_length=32768`), contando prompt más tokens generados; reducir la profundidad no amplía este límite |
| Tipos de cuantización | no disponible (la precisión original se conserva en la configuración, pero no se publican pesos que cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | sin pesos (el repositorio no incluye ficheros de pesos); manifiesto de procedencia y script `qwen1-72b-1layer.run`; carga con SGLang nativo y `--load-format dummy` |

## Arquitectura y entrenamiento

El artefacto deriva de Qwen/Qwen-72B (revisión `b8e18ac61df64d35308695769ff46b976b6a00f4`). La model card documenta una única capa con la siguiente correspondencia: capa 0 del artefacto = capa 0 del modelo fuente (índice cero), con atención multi-cabeza (MHA), FFN densa y sin PLE. Se conservan las dimensiones de texto, la configuración de contexto/RoPE y los ajustes de precisión originales. No se retiene ningún módulo MTP (el número indicado es 0) y se precisa que la decodificación ordinaria `one_batch` no ejecuta MTP.

No hay información sobre entrenamiento: la model card no declara número de tokens, composición del dataset, ni fases de alineación (RLHF, DPO u otras). El manifiesto del repositorio sirve para registrar la procedencia y, según la propia documentación, no es una entrada de ejecución. El propósito del artefacto es servir de soporte a pruebas de runtime y al análisis de tipos de capa descrito en `docs/frontier-layer-types.md`, no a la inferencia con calidad de producción.

## Capacidades

- Generación de texto: no disponible. Al no incluir pesos y conservar una sola capa, el artefacto no puede producir salida de texto coherente.
- Razonamiento, código, matemáticas y visión: no disponibles. La model card indica que se trata de un banco de pruebas solo texto ("text-only benchmark").
- Tool calling / function calling: no soportado según la información disponible.
- Agentes y razonamiento multi-paso: no soportado según la información disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales declaradas: preservación de la configuración de contexto y RoPE a 32.768 tokens; MTP desactivado en decodificación ordinaria `one_batch` (0 módulos MTP retenidos); ejecución del camino de atención MHA y FFN densa sobre CUDA mediante SGLang con carga dummy.
- Función real del artefacto: validación de rutas de carga, medición de memoria de caché KV y latencias de atención, y verificación de scripts de despliegue sin coste de pesos.

## Casos de uso

- Validación de SGLang en un nodo CUDA: ejecutar `bash qwen1-72b-1layer.run` desde la raíz del checkout permite comprobar que el runtime nativo arranca con `--load-format dummy` antes de desplegar el modelo completo, reduciendo el tiempo de diagnóstico.
- Medición de memoria de caché KV a contexto largo: al no materializar pesos, la memoria observada se atribuye casi por completo a activaciones y caché KV, lo que facilita aislar el coste de atender 32.768 tokens por secuencia.
- Pruebas de regresión en CI/CD: integrar el script de ejecución en una canalización que verifique, en cada cambio de versión del runtime, que la ruta de carga dummy sigue funcionando en una máquina CUDA concreta.
- Estudio de tipos de capa "frontera": comparar el comportamiento de una capa con MHA y FFN densa frente a otras variantes descritas en `docs/frontier-layer-types.md`, sin necesidad de disponer de los pesos completos.
- Planificación de capacidad y presupuesto: estimar el coste por token y el throughput máximo teórico del camino de ejecución (planificación, atención, muestreo) antes de comprometer GPU para el modelo completo.
- Verificación del comportamiento de MTP: confirmar que la decodificación ordinaria `one_batch` no ejecuta módulos MTP cuando el número retenido es 0, útil para comparar rutas de decodificación.
- Reproducibilidad y trazabilidad de artefactos: usar el manifiesto como registro de procedencia (revisión de origen, capa seleccionada, ajustes de precisión) en informes internos o publicaciones, dado que no es una entrada de ejecución.
- Material didáctico: ilustrar de forma aislada una capa decodificadora con atención MHA y FFN densa para explicar el flujo de un transformer sin la complejidad de una pila completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un banco de pruebas "text-only benchmark", pero no incluye cifras de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación.

## Requisitos de hardware

- VRAM de pesos: 0 en la práctica, ya que `--load-format dummy` no materializa pesos; no se dispone de cifra declarada.
- VRAM para activaciones y caché KV: no disponible. Depende de las dimensiones internas del modelo fuente, que la model card no detalla numéricamente.
- GPU recomendadas: no disponible. El único requisito explícito es disponer de una máquina con CUDA.
- Viabilidad en GPU de consumo: no evaluable con la información disponible, al no existir pesos ni requisitos declarados.
- Opciones de despliegue: SGLang nativo, obligatorio según la model card. Otros runtimes (vLLM, llama.cpp, Ollama, TGI) no están documentados para este artefacto.
- Latencia y throughput: no disponibles.
- Requisito de contexto: soportar `seq_length=32768`; reducir la profundidad del modelo no relaja este límite.
- Ejecución: `bash qwen1-72b-1layer.run` desde la raíz del checkout, en una máquina CUDA.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pTpTk/qwen1-72b-1layer | no disponible (sin pesos) | 1 representativa | 32.768 tokens | no disponible | Repositorio HuggingFace, 0 descargas, 0 "likes" |
| Qwen/Qwen-72B (modelo fuente) | no disponible en la información proporcionada (datos públicos del modelo base no incluidos aquí) | no disponible en la información proporcionada | 32.768 tokens según la model card del artefacto | no disponible en la información proporcionada | Repositorio público de Qwen |
| Otros artefactos de capas representativas o podados | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de ninguna de las alternativas en la información proporcionada, por lo que la comparación se limita a la procedencia y a la ventana de contexto declarada.

## Limitaciones y advertencias

- No contiene pesos: es imposible obtener inferencia con calidad de texto; cualquier uso generativo produciría salida sin sentido.
- Con una sola capa, el artefacto no representa el comportamiento del modelo completo ni permite extrapolar calidad de respuesta.
- La licencia no está declarada en el repositorio, lo que impide determinar si el uso comercial está permitido. Al derivar de Qwen/Qwen-72B, habría que verificar además las condiciones del modelo de origen antes de cualquier uso productivo.
- No se declaran idiomas soportados; la model card solo indica que el banco de pruebas es de texto.
- El repositorio está etiquetado con `custom_code`, lo que implica la presencia de código personalizado que debe auditarse antes de ejecutarlo en un entorno propio.
- La ventana de contexto está fijada en 32.768 tokens y la propia model card advierte de que reducir la profundidad no la amplía.
- La decodificación ordinaria `one_batch` no ejecuta MTP, de modo que cualquier medición de latencia debe interpretarse como la ruta sin decodificación especulativa.
- Dependencia estricta de SGLang nativo con `--load-format dummy`; no hay soporte documentado para otros motores de inferencia.
- El manifiesto registra procedencia y no es una entrada de ejecución: no debe usarse para configurar el runtime.
- Sin descargas ni "likes" y sin revisión externa conocida, no existe validación comunitaria de su funcionamiento.
- Fechas del repositorio: creado y actualizado el 2026-10-13.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pTpTk/qwen1-72b-1layer
- Modelo fuente (Qwen/Qwen-72B, revisión citada): https://huggingface.co/Qwen/Qwen-72B/tree/b8e18ac61df64d35308695769ff46b976b6a00f4
- Documentación de requisitos de SGLang nativo y tipos de capa: `docs/frontier-layer-types.md` (incluido en el checkout del repositorio)
- Script de ejecución: `qwen1-72b-1layer.run` (incluido en el checkout del repositorio)
