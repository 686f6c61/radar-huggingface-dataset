# mdcccxv/papertrail-qwen3-0.6b

## Resumen

`mdcccxv/papertrail-qwen3-0.6b` es una exportación del modelo Qwen3 0.6B de Alibaba al formato ExecuTorch (`.pte`) para su ejecución en dispositivos móviles. El autor, mdcccxv, parte del modelo base `Qwen/Qwen3-0.6B` y aplica la misma receta de exportación y cuantización que publica la librería `react-native-executorch` v0.11.0 de Software Mansion, pero reduciendo la ventana de contexto de 8.192 a 2.048 tokens. El resultado es un fichero de unos 506 MB que ocupa aproximadamente la mitad de memoria que la versión oficial de la librería.

El modelo resuelve un problema muy concreto: desplegar un LLM generativo dentro de una aplicación React Native en Android sin depender de la nube, con un consumo de memoria contenido. Al recortar el contexto a 2.048 tokens y ajustar la memoria reservada para el mismo, el modelo se vuelve viable en teléfonos con recursos limitados donde la versión de 8.192 tokens no cabría o provocaría cierres por presión de memoria.

Se trata de un modelo de 0,6 mil millones de parámetros, cuantizado en 8da4w (activaciones de 8 bits, pesos de 4 bits) sobre el backend XNNPACK de ExecuTorch. La licencia es Apache 2.0, heredada del modelo base. Es relevante para desarrolladores que necesiten inferencia local en móvil con un modelo pequeño, multilingüe en origen aunque la model card declara solo inglés, y con la garantía de un binario reproducible (SHA-256 publicado) probado contra una versión concreta del runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), exportado a ExecuTorch |
| Parametros totales | 0,6 mil millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | 8da4w (activaciones 8 bits, pesos 4 bits) |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch), fichero `papertrail-qwen3-0.6b-8da4w-ctx2048.pte` de 505.687.168 bytes |

## Arquitectura y entrenamiento

El modelo base es Qwen3 0.6B, un transformer decoder-only de la familia Qwen3. Esta exportación no reentrena ni modifica los pesos: parte del checkpoint original y los convierte a un grafo ExecuTorch mediante la receta de exportación de Software Mansion (`exporter_models/qwen3`, commit `89a24bd038577f7438fb004624c87ca9790edf5c`). El proceso se ejecutó con ExecuTorch 1.4.1, PyTorch 2.13.0 (CPU) y torchao 0.18.0 sobre Linux x86_64. La versión de ExecuTorch 1.4.1 coincide con el runtime de `react-native-executorch` 0.11.0, lo que garantiza compatibilidad binaria.

Las modificaciones respecto a la receta original son tres: fijar la longitud máxima de contexto y de secuencia en 2.048 tokens, mantener los dos tokens de parada `<|im_end|>` (151645) y `<|endoftext|>` (151643), y añadir el método `get_model_schema` que la receta no incluye pero que `react-native-executorch` necesita para aceptar longitudes de entrada variables. La cuantización 8da4w reduce los pesos a 4 bits y las activaciones a 8 bits, con el backend XNNPACK encargado de los kernels de cómputo en CPU. No se dispone de información sobre el dataset de entrenamiento del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto autoregresiva en inglés, con la calidad propia de un modelo de 0,6B parámetros.
- Inferencia completamente local en dispositivo (on-device), sin llamadas a servicios externos.
- Integración con React Native mediante `react-native-executorch` 0.11.0, reutilizando el tokenizer de la librería.
- Soporte de entradas de longitud variable gracias al método `get_model_schema` añadido en la exportación.
- Gestión de tokens de parada estándar de Qwen3 (`<|im_end|>`, `<|endoftext|>`).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Asistentes de texto embebidos en aplicaciones Android: el modelo se carga con `react-native-executorch` y responde localmente a peticiones de generación de texto cortas, sin latencia de red ni coste por token.
- Autocompletado y sugerencias dentro de formularios o editores: con 2.048 tokens de contexto cabe un prompt con instrucciones y varios turnos de historial breve, suficiente para sugerencias contextuales.
- Clasificación y etiquetado de texto en el dispositivo: peticiones de pocas líneas (por ejemplo, categorizar un mensaje) caben holgadamente en la ventana de 2.048 tokens y se resuelven sin salir del teléfono.
- Resumen de notas o mensajes cortos: el modelo puede condensar textos que junto con el prompt no superen los 2.048 tokens, útil en apps de notas o correo con contenido breve.
- Prototipado de funciones de IA generativa en React Native: al ser un `.pte` compatible con la configuración `QWEN3_0_6B` de la librería, permite sustituir el fichero oficial por uno de menor huella de memoria para probar en dispositivos con poca RAM.
- Aplicaciones con requisitos de privacidad estrictos: al no enviar datos a servidores, encaja en escenarios donde el texto del usuario no puede salir del dispositivo (por ejemplo, diarios personales o mensajería interna).
- Demos y pruebas de concepto de inferencia LLM en móvil: el tamaño de 506 MB y el contexto reducido facilitan incluirlo en builds de prueba y validar el pipeline ExecuTorch antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero pesa 505.687.168 bytes (unos 482 MiB); el autor indica que el modelo necesita aproximadamente la mitad de memoria que la versión de 8.192 tokens de la librería, gracias a la reducción del espacio reservado para el contexto.
- GPU: no aplica; la exportación es para CPU móvil con el backend XNNPACK de ExecuTorch.
- Cabe en dispositivos Android de gama media y alta; el autor solo ha probado en Android con `react-native-executorch` 0.11.0.
- Opciones de despliegue: ExecuTorch 1.4.1 como runtime, a través de `react-native-executorch` 0.11.0 en aplicaciones React Native. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.pte` es específico de ExecuTorch.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| papertrail-qwen3-0.6b (esta ficha) | 0,6B | 2.048 | `.pte` (ExecuTorch, 8da4w) | Apache 2.0 | Exportación independiente, ~482 MiB, probada en Android |
| Qwen3 0.6B oficial de react-native-executorch | 0,6B | 8.192 | `.pte` (ExecuTorch, 8da4w) | Apache 2.0 | Misma receta y cuantización; requiere el doble de memoria para el contexto |
| Qwen/Qwen3-0.6B (modelo base) | 0,6B | 8.192 (según model card del base) | safetensors | Apache 2.0 | Pesos originales sin exportar; no ejecutable directamente en ExecuTorch |

## Limitaciones y advertencias

- El propio autor advierte que es un modelo de 0,6B parámetros y puede dar respuestas incorrectas; el riesgo de alucinación es alto en tareas que requieran conocimiento factual preciso.
- La ventana de contexto de 2.048 tokens es la mitad que la del fichero oficial de la librería: prompt y respuesta deben caber juntos en ese límite. Si el caso de uso necesita más contexto, hay que usar el fichero de la librería.
- Solo se ha probado en Android con `react-native-executorch` 0.11.0; no hay validación documentada en iOS ni con otras versiones del runtime.
- La model card declara únicamente inglés como idioma soportado, aunque el modelo base Qwen3 es multilingüe en origen; el rendimiento en castellano no está verificado.
- Es una compilación independiente, no una release oficial de Qwen ni de Software Mansion; conviene fijar el enlace a un commit concreto y verificar el SHA-256 tras la descarga.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución al equipo Qwen y respetar los términos del modelo base.
- El tokenizer debe ser el de `react-native-executorch`, no se incluye uno propio en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdcccxv/papertrail-qwen3-0.6b
- Modelo base Qwen3 0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Equipo Qwen en Hugging Face: https://huggingface.co/Qwen
- Librería react-native-executorch: https://github.com/software-mansion/react-native-executorch
- Recetas de exportación de Software Mansion: https://github.com/software-mansion-labs/executorch-export-recipes
- Software Mansion: https://swmansion.com/
