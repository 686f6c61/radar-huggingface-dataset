# MoxxyLabsAI/kern-ts-lora

## Resumen

Kern TS module v0.6 es un adaptador LoRA sobre el tronco Qwen3.5-4B, desarrollado por MoxxyLabsAI, especializado en edición de código TypeScript. No es un asistente conversacional: el adaptador restringe el modelo base a una única tarea, recibir los ficheros de un proyecto y una instrucción, y devolver una edición estructurada en el denominado formato Kern que compile bajo TypeScript estricto, pase las reglas recomendadas de ESLint y esté formateada con Prettier. Alternativamente, el modelo puede formular una única pregunta aclaratoria o rechazar la petición si queda fuera de su dominio.

El modelo se distribuye como adaptador LoRA en f16 (65 MB) más una cuantización Q4_K_M del tronco Qwen3.5-4B (2,78 GB), ambos en formato GGUF para llama.cpp. El tronco se ejecuta con el modo thinking desactivado y permanece compartido entre módulos, de modo que el adaptador solo añade la especialización. La ventana de contexto es de 16 384 tokens, aunque el autor indica que el modelo fue evaluado con prompts de entre 1 000 y 7 000 tokens.

La relevancia del modelo reside en su enfoque de producto: la respuesta del modelo se aplica dentro de una transacción de edición en la que el host ejecuta `tsc`, ESLint y los tests sobre una copia del repositorio, aceptando el cambio o revirtiéndolo, con un turno de reparación adicional en caso de fallo. Está pensado para ediciones locales pequeñas (arreglos de compilación, reparación de diagnósticos, cambios de función, corrección de tests), no para escribir funcionalidades desde cero. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (tronco Qwen3.5-4B) |
| Parametros totales | 32.464.896 (adaptador LoRA, safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16 384 tokens |
| Tipos de cuantizacion | Q4_K_M (tronco); adaptador en f16 |
| Idiomas soportados | en, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors para el adaptador |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango bajo entrenado sobre Qwen/Qwen3.5-4B en la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`. El tronco es la versión post-entrenada de Qwen3.5-4B y se ejecuta con el modo thinking desactivado. El adaptador se aplica en tiempo de ejecución en llama.cpp, lo que permite compartir el tronco entre distintos módulos especializados. El repositorio incluye una cuantización Q4_K_M propia del tronco (2,78 GB) y el adaptador en f16 (65 MB).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. El autor menciona que el modelo fue entrenado y evaluado con una plantilla de prompt exacta (chat template del tronco, thinking off) que incluye un system prompt con el formato Kern y un mensaje de usuario con los ficheros del proyecto, una sección opcional de diagnósticos (`file:line code message`) y la instrucción. Las instrucciones pueden estar en inglés o en polaco. El tronco Qwen3.5 soporta una cabeza de predicción multi-token (MTP) que el autor emplea para decodificación especulativa (`--spec-type draft-mtp --spec-draft-n-max 2`), acelerando la decodificación.

## Capacidades

- Edición de código TypeScript: dado un conjunto de ficheros y una instrucción, devuelve bloques `<edit path="..." symbol="...">` con el contenido completo de la declaración de nivel superior reemplazada (función, clase, interfaz, tipo, enum o const), o `Class.method` para miembros de clase.
- Modo fichero completo: bloques `<file path="...">` para ficheros pequeños.
- Pregunta aclaratoria: `<act:clarify>` cuando falta un dato necesario que no puede leerse del código.
- Rechazo: `<act:refuse>` cuando la petición queda fuera de la edición de código TypeScript.
- Reparación guiada por diagnósticos: acepta una sección `Diagnostics:` con líneas `file:line code message` para corregir errores de compilación o lint.
- Cumplimiento de estándares: el código generado debe compilar bajo TypeScript estricto, pasar ESLint recommended y estar formateado con Prettier a 80 columnas.
- Multilingüe en instrucciones: inglés y polaco.
- No soporta tool calling, function calling ni razonamiento multi-paso agéntico; el autor indica explícitamente que no es un asistente conversacional.

## Casos de uso

- Reparación de errores de compilación: se pasa al modelo el fichero afectado junto con la sección `Diagnostics:` extraída de `tsc` y la instrucción de corregir; el modelo devuelve la declaración completa corregida, que el harness valida ejecutando `tsc` sobre una copia del repositorio antes de aceptar el cambio.
- Corrección de avisos de ESLint: ante una línea `file:line code message` de ESLint recommended, el modelo reescribe la función o declaración afectada sin usar `eslint-disable`, manteniendo el formato Prettier a 80 columnas.
- Cambios de firma o comportamiento de funciones: instrucciones del tipo "parseRange debe aceptar también '5..10'" se traducen en la sustitución completa de la declaración de la función, con el símbolo identificado por nombre.
- Corrección de tests fallidos: el modelo puede recibir el diagnóstico del test y la instrucción de arreglar la función de producción (nunca los tests ni la configuración, que el harness rechaza), dentro del turno de reparación tras un fallo de checks.
- Integración en pipelines de CI/CD: el adaptador se sirve con `llama-server` en local y el harness aplica la edición en una transacción con `tsc`, ESLint y tests, revirtiendo automáticamente si algún check falla; encaja en flujos de revisión automática de parches pequeños.
- Asistencia local en el editor: con un tronco Q4_K_M de 2,78 GB y unos 4 GB de memoria libre, el modelo puede ejecutarse en una máquina de desarrollo sin GPU dedicada y aplicarse a tareas de una sola declaración sobre proyectos pequeños (prompts de 1 000 a 7 000 tokens).
- Reparación de diagnósticos en lote: al compartir el tronco entre módulos, un mismo servidor llama.cpp puede atender varias especializaciones (por ejemplo, distintos lenguajes) con adaptadores separados, reutilizando la cuantización base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo indica que el modelo fue evaluado con prompts de 1 000 a 7 000 tokens y que la decodificación se acelera con la cabeza MTP del tronco Qwen3.5 (`--spec-type draft-mtp --spec-draft-n-max 2`), sin cifras de latencia ni throughput.

## Requisitos de hardware

- VRAM/memoria estimada: unos 4 GB de memoria libre para el tronco Q4_K_M (2,78 GB) más el adaptador f16 (65 MB) y el contexto; el autor indica "about 4 GB of free memory".
- GPU recomendadas: no disponibles en la información proporcionada; el despliegue documentado es con llama.cpp, que permite ejecución en CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4-5 GB de VRAM efectiva para el tronco cuantizado, aunque el autor no especifica modelos concretos.
- Opciones de despliegue: `llama-server` de llama.cpp (build de octubre de 2026 o posterior, con soporte de Qwen3.5; el autor despliega el commit `8bb3cf0` del 2026-10-12), con `--jinja` para el chat template y `-c 16384` de contexto. No se mencionan vLLM, TGI, Ollama ni otras opciones.
- Latencia y throughput: no disponibles; el script `kern_try.py` imprime los tiempos de la respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| Kern TS module v0.6 (este) | 32,5 M (adaptador LoRA) sobre Qwen3.5-4B | 16 384 | Edición de código TypeScript con checks de toolchain | Apache 2.0 | GGUF + LoRA f16 |
| Qwen3.5-4B (tronco) | 4B | no disponible | Propósito general, chat | Apache 2.0 | safetensors, GGUF |
| Otros adaptadores LoRA de código sobre troncos pequeños | no disponible | no disponible | Edición o generación de código | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente conversacional: el adaptador está restringido a la tarea de edición de código TypeScript en el formato Kern; las peticiones fuera de dominio deben rechazarse.
- Alcance limitado a ediciones pequeñas y locales (arreglo de compilación, reparación de diagnóstico, cambio de función, corrección de test); no está pensado para escribir funcionalidades desde cero.
- Ventana de contexto de 16 384 tokens, pero evaluado con prompts de 1 000 a 7 000 tokens; proyectos grandes pueden degradar el rendimiento.
- Solo admite instrucciones en inglés y polaco.
- No puede editar tests ni configuración, ni usar `@ts-ignore`, `@ts-expect-error` o `eslint-disable`; el harness rechaza ese tipo de ediciones.
- El script `kern_try.py` no aplica la edición: el usuario debe leer los bloques `<edit>` y aplicarlos manualmente o usar el harness del producto.
- Riesgo de alucinación no cuantificado en la información disponible; el diseño mitiga errores mediante la transacción con `tsc`, ESLint y tests, más un turno de reparación.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0, que permite uso comercial; debe conservarse el aviso de licencia y atribución correspondiente.
- Requiere un build de llama.cpp de octubre de 2026 o posterior con soporte de Qwen3.5 y `--jinja`; versiones anteriores no cargarán el modelo correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MoxxyLabsAI/kern-ts-lora
- Tronco Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
- Ejemplo público incluido en el repo: `example/ex-ts-0001-parse-range/`
- Script de prueba incluido en el repo: `kern_try.py`
