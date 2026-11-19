# nuiun/Ternary-Bonsai-2-27B-Heretic-t5-DFlash2-sm86-Bundle

## Resumen

Ternary-Bonsai-2-27B-Heretic-t5-DFlash2-sm86-Bundle es un paquete de despliegue listo para usar publicado por el usuario nuiun en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un reempaquetado del modelo `emiltsoi/Ternary-Bonsai-2-27B-Uncensored-Heretic-NInfer` en un formato ternario compacto (base-3, esquema `t5_g128_fp16`), acompañado de un runtime CUDA 12.9 precompilado para arquitectura `sm_86` y de un script de arranque para Windows. El objetivo declarado es ejecutar un modelo de 27B en GPU de consumo con 16 GB de VRAM, como la RTX 3080 de 16 GB, la 3080 Ti o la 3090.

El paquete conserva las características del modelo base: una variante "uncensored" y "heretic" (es decir, con el alineamiento de rechazo reducido o eliminado), decodificación especulativa DFlash2 con MTP (multi-token prediction) y un codificador visual asociado a Qwen3.8-27B Vision. El repositorio ocupa 11,3 GB y no incluye pipeline declarado, licencia ni idiomas en los metadatos de Hugging Face.

La relevancia de esta ficha es limitada pero concreta: muestra una vía práctica de inferencia de un modelo grande cuantizado en ternario sobre hardware consumer, empaquetada como binario con runtime propio. No hay información publicada sobre datos de entrenamiento, benchmarks ni evaluación de calidad, por lo que la ficha se limita a documentar lo que el autor declara y a señalar explícitamente los datos ausentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del modelo base; detalles no disponibles) |
| Parametros totales | 27B (según el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Configurable en el arranque: 512K, 256K, 192K (por defecto), 128K o 96K |
| Tipos de cuantizacion | Ternaria base-3, esquema `t5_g128_fp16`; compresión KV `rk4v4` / `rk8v4` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Formato propietario del runtime `ninfer` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura interna del modelo base más allá de su nombre y de las capacidades declaradas. Se sabe que el modelo subyacente es un transformer de 27B parámetros, que incorpora un codificador visual identificado como Qwen3.8-27B Vision y que soporta decodificación especulativa DFlash2 con multi-token prediction (MTP). La cuantización ternaria se aplica con un esquema `t5_g128_fp16`, que agrupa pesos en bloques de 128 con escalas en fp16, un patrón habitual en cuantización de baja precisión orientada a reducir huella de memoria.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento. La etiqueta "heretic" indica precisamente lo contrario de un alineamiento estándar: el modelo base ha sido modificado para reducir o eliminar las conductas de rechazo. Tampoco se detalla el proceso de reempaquetado más allá de la afirmación de que es "sin pérdida" respecto al modelo base.

## Capacidades

- Generación de texto y conversación multi-turno con ventanas de contexto configurables de hasta 512K tokens.
- Reconocimiento de imágenes mediante el codificador visual Qwen3.8-27B Vision, activable opcionalmente en el arranque.
- Decodificación especulativa DFlash2 con MTP para acelerar la generación.
- Modo "uncensored": el modelo está modificado para no aplicar rechazos de contenido, lo que cambia radicalmente su comportamiento frente a un modelo alineado.
- Servidor de API local compatible con el formato OpenAI (`/v1`), lo que permite integrarlo con clientes existentes.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en GPU de 16 GB: el paquete está diseñado para arrancar en una RTX 3080 de 16 GB, 3080 Ti o 3090 mediante `start.bat`, lo que permite probar un modelo de 27B en hardware de consumo sin montar un stack de serving propio.
- Experimentación con cuantización ternaria: útil para investigadores que quieran evaluar la calidad de un modelo de 27B comprimido en base-3 frente a alternativas de 4 u 8 bits, aunque sin benchmarks publicados la comparación deberá hacerse por cuenta propia.
- Prototipado de asistentes con entrada visual: al activar el modo de imagen en el arranque, el servidor local expone capacidades de reconocimiento visual sobre la API compatible con OpenAI, lo que facilita integrarlo en prototipos de análisis de documentos o imágenes.
- Pruebas de decodificación especulativa: el paquete incluye DFlash2 y MTP, por lo que sirve para medir la ganancia de throughput de la decodificación especulativa en un entorno controlado.
- Investigación sobre alineamiento y censura: al ser una variante "heretic", es un objeto de estudio para analizar qué comportamientos cambian al eliminar el alineamiento de rechazo, siempre con las cautelas legales y éticas correspondientes.
- Despliegue de un endpoint local compatible con OpenAI para herramientas de desarrollo: el servidor en `http://127.0.0.1:8080/v1` con el identificador `qwen3.8-27b-uncensored` permite conectar editores, agentes o scripts que ya hablen el protocolo de OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM objetivo: 16 GB, según el autor (RTX 3080 16G, 3080 Ti, 3090).
- GPU soportadas por el runtime incluido: arquitectura `sm_86` (Ampere), con CUDA 12.9.
- GPU no soportadas por el binario precompilado: tarjetas con otras arquitecturas (por ejemplo, `sm_89` de Ada o `sm_90` de Hopper) requerirían recompilar el runtime.
- Cabe en GPU de consumo: sí, en los modelos indicados por el autor; no hay datos para GPUs con menos de 16 GB.
- Despliegue: runtime propietario `ninfer` con script `start.bat` para Windows; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor no publica cifras.
- El paquete usa compresión KV `rk4v4`/`rk8v4` y desbordamiento a memoria del sistema para ajustar la ventana de contexto a la VRAM disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-Heretic (este paquete) | 27B | hasta 512K (configurable) | ternaria `t5_g128_fp16` | no disponible | Hugging Face, runtime `ninfer` para Windows |
| emiltsoi/Ternary-Bonsai-2-27B-Uncensored-Heretic-NInfer | 27B | no disponible | ternaria | no disponible | Hugging Face (modelo base) |
| Alternativas de 27B en 4 bits (familia Qwen, Gemma, etc.) | ~27B | variable | 4 bits (GGUF/AWQ/GPTQ) | variable según modelo | amplia, con soporte en llama.cpp, vLLM y Ollama |

La comparación con alternativas de la misma categoría no puede completarse con datos de rendimiento porque no hay benchmarks publicados de este paquete. La diferencia principal frente a las alternativas de 4 bits es el formato ternario y el runtime cerrado, que limita la portabilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre la calidad del modelo tras la cuantización ternaria ni sobre su degradación respecto al modelo base.
- Modelo "uncensored" y "heretic": no aplica filtros de rechazo, lo que implica riesgos legales y de seguridad si se despliega en producción orientada al público.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; hay que verificar la licencia del modelo base antes de cualquier uso productivo.
- Idiomas no declarados: se desconoce el soporte real de castellano u otras lenguas.
- Formato propietario: los pesos no están en safetensors ni GGUF, por lo que no se pueden cargar con las herramientas estándar del ecosistema.
- Runtime limitado a `sm_86` y Windows: el binario incluido no funcionará en GPUs de otras arquitecturas ni en Linux sin recompilación.
- Riesgo de alucinación: no cuantificado; al no haber evaluación, debe asumirse un riesgo estándar o superior en un modelo sin alineamiento.
- Contexto máximo de 512K sujeto a la VRAM: en 16 GB el autor recomienda 192K por defecto, por lo que el contexto real disponible será menor que el máximo nominal.
- Repositorio sin descargas ni likes y con fecha de creación futura en los metadatos: la trazabilidad y el mantenimiento del paquete no están garantizados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nuiun/Ternary-Bonsai-2-27B-Heretic-t5-DFlash2-sm86-Bundle
- Modelo base: https://huggingface.co/emiltsoi/Ternary-Bonsai-2-27B-Uncensored-Heretic-NInfer
