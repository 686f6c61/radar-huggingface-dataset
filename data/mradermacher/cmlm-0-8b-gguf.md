# mradermacher/CMLM-0.8B-GGUF

## Resumen

El modelo CMLM-0.8B es un modelo de lenguaje pequeño (0.8 mil millones de parámetros) desarrollado por Natarizki y cuantizado a formato GGUF por mradermacher para su uso en entornos locales. Está diseñado específicamente para generación de código y razonamiento matemático, con un entrenamiento supervisado (SFT) mediante LoRA sobre una base de Qwen3.5. El modelo se distribuye bajo licencia Apache-2.0 y está pensado para inferencia eficiente en hardware limitado, con un tamaño de contexto no especificado en la información disponible.

La cuantización GGUF permite ejecutarlo en CPU y GPU de gama baja, con múltiples niveles de precisión (desde Q2_K hasta f16). Su pequeño tamaño lo hace atractivo para prototipos, desarrollo en dispositivos edge y entornos donde el coste de inferencia es crítico. Aunque no se han publicado benchmarks oficiales, los datasets de entrenamiento (Magicoder-Evol-Instruct, MetaMathQA, NuminaMath-CoT) indican un enfoque claro en tareas de programación y matemáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, basado en Qwen3.5 (segun tags) |
| Parametros totales | 772.845.888 (0.8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo es una adaptacion LoRA (Low-Rank Adaptation) sobre la arquitectura Qwen3.5, con un tamano total de 772 millones de parametros. El entrenamiento se realizo mediante aprendizaje supervisado (SFT) sobre tres datasets publicos: Magicoder-Evol-Instruct-110K (generacion de codigo), MetaMathQA (razonamiento matematico) y NuminaMath-CoT (razonamiento matematico con cadena de pensamiento). No se especifican detalles sobre el numero de tokens de entrenamiento, la composicion exacta de los datos ni el uso de tecnicas como RLHF o DPO. La cuantizacion GGUF posterior permite reducir el peso del modelo a menos de 1 GB, manteniendo un equilibrio entre calidad y velocidad.

## Capacidades

- Generacion de codigo: entrenado con Magicoder-Evol-Instruct, especializado en producir fragmentos de codigo correctos.
- Razonamiento matematico: optimizado para resolver problemas aritmeticos y algebraicos mediante cadenas de pensamiento.
- Razonamiento conversacional: basado en Qwen3.5, conserva habilidades de dialogo y respuesta a instrucciones.
- Soporte multimodal: los archivos mmproj incluidos sugieren compatibilidad con entradas de imagen, aunque no se detalla la implementacion.
- No se ha confirmado soporte para tool calling ni function calling.
- Idioma: exclusivamente ingles, sin datos sobre capacidades multilingues.

## Casos de uso

- Generacion de codigo en entornos con restricciones de memoria: el modelo en cuantizacion Q4_K_M (0.6 GB) puede ejecutarse en una Raspberry Pi o en un portatil con 4 GB de RAM, permitiendo autocompletar o generar funciones simples en Python, JavaScript o similares.
- Asistente de programacion offline: integrable en editores de codigo (VS Code, Neovim) via servidores compatibles con GGUF, para sugerencias de codigo sin conexion a internet.
- Resolucion de problemas matematicos en entornos educativos: capaz de explicar pasos de resolucion de ecuaciones y problemas de algebra, util en aplicaciones de tutoria automatizada.
- Prototipado rapido de agentes de razonamiento: su tamano reducido permite iterar sobre logicas de cadena de pensamiento en entornos de desarrollo sin necesidad de GPUs dedicadas.
- Ejecucion en dispositivos de borde (edge computing): por su bajo consumo de VRAM, puede desplegarse en sistemas embebidos o en la nube con instancias de CPU puras.
- Investigacion en cuantizacion: al ser un modelo pequeno, sirve como banco de pruebas para comparar el efecto de distintas cuantizaciones (Q2, Q4, Q6) en la precision de tareas de codigo y matematicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para cuantizacion Q4_K_M (0.6 GB de peso), la VRAM necesaria es aproximadamente 0.6-1 GB (dependiendo del tamaño del contexto). Para Q8_0 (0.9 GB) se requieren unos 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2050, etc.) puede ejecutar las cuantizaciones mas bajas. Para las mas altas, una GPU con 4 GB es suficiente.
- En CPU: se puede ejecutar en procesadores modernos con 4-8 GB de RAM, usando llama.cpp o Ollama. El rendimiento es de unos 10-20 tokens por segundo en CPU de gama media.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, o servidores como vLLM (aunque vLLM no soporta GGUF, si se puede convertir a safetensors).
- Latencia y throughput: no hay datos oficiales, pero para un modelo de 0.8B en Q4, la generacion es de aproximadamente 30-50 tokens por segundo en una GPU moderna (RTX 3060) y 10-20 en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CMLM-0.8B | 0.8B | no disponible | Apache-2.0 | GGUF | Especializado en codigo y matematicas |
| Qwen2.5-0.5B | 0.5B | 32K | Apache-2.0 | safetensors/GGUF | Modelo general de menor tamano |
| Llama-3.2-1B | 1B | 128K | Llama 3.2 Community | safetensors/GGUF | Modelo general de 1B, mayor contexto |
| Gemma-2-2B | 2B | 8K | Gemma license | safetensors/GGUF | Modelo general de 2B, mas capaz |

CMLM-0.8B se diferencia por su enfoque especifico en tareas de codigo y matematicas, mientras que los otros son modelos generales. Su tamano intermedio (0.8B) lo sitúa entre Qwen2.5-0.5B y Llama-3.2-1B, pero sin datos de benchmarks no se puede afirmar que supere a ninguno en estas tareas.

## Limitaciones y advertencias

- Al ser un modelo de solo 0.8B, tiene una capacidad limitada para tareas complejas de razonamiento o comprension de contextos largos.
- No se ha confirmado la longitud de contexto; probablemente sea corta (4K o 8K), lo que limita su uso en documentos extensos.
- Solo soporta inglesa; no hay datos de capacidad multilingue.
- Puede alucinar en codigo o en resultados matematicos, especialmente en cuantizaciones bajas (Q2, Q3).
- No se han publicado resultados de evaluacion, por lo que su calidad es incierta.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base (Qwen3.5) puede tener restricciones adicionales si no es totalmente open-weight; se recomienda verificar la licencia del modelo base.
- Los archivos mmproj sugieren soporte multimodal, pero no se documenta su funcionamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CMLM-0.8B-GGUF
- Modelo base: https://huggingface.co/Natarizki/CMLM-0.8B
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Referencia de cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
