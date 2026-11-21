# lyffseba/pingi-smo

## Resumen

`pingi-smo` es un checkpoint de ajuste fino publicado por el usuario `lyffseba` sobre el modelo base `thinkingmachines/Inkling-2-Mini`. No se trata de un modelo nuevo ni de un lanzamiento con intención de producción: según la propia model card, es un "smoke-test checkpoint" de tres pasos sobre el benchmark `terminal-bench-2.0`, diseñado para verificar que el bucle de herramientas `pi`, el grader Harbor, la sesión de Tinker y la publicación de checkpoints funcionan correctamente de extremo a extremo. El autor lo describe explícitamente como "no es un modelo de código terminado".

La relevancia de esta ficha es, por tanto, acotada y de carácter técnico: documenta un artefacto de validación de infraestructura, no un modelo evaluable para tareas reales. Los pesos no están alojados en el repositorio de Hugging Face, sino publicados en la plataforma Tinker de Thinking Machines, que además deshabilita la descarga de ficheros para este modelo base (error `403 Checkpoint downloads are disabled`). Cualquier uso requiere una cuenta de Tinker y cargar el checkpoint mediante su ruta específica.

No se dispone de información sobre arquitectura, número de parámetros, longitud de contexto ni idiomas soportados más allá de lo que se pueda inferir del modelo base, que tampoco se detalla en la información proporcionada. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de `thinkingmachines/Inkling-2-Mini`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en el repositorio; pesos alojados en Tinker (rutas `tinker://`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del modelo base `thinkingmachines/Inkling-2-Mini`. Lo único documentado es el procedimiento de ajuste fino aplicado: LoRA de rango 32 sobre las proyecciones de atención, MLP y unembed, optimizador AdamW, y un total de tres pasos de entrenamiento sobre el entorno `terminal-bench-2.0` en modo de razonamiento `none` (sin thinking mode). El entrenamiento se ejecutó en la infraestructura Tinker de Thinking Machines, con sesión de consola identificada como `e7bba24a-6366-5c8c-93b8-21e624a621a6` y nombre de visualización `pingi-smo`.

Los resultados por paso fueron: paso 0 con `test_passed=1.0`, reward 1.015 y 12 turnos por episodio; paso 1 con `test_passed=0.0`, reward 0.0 y 15 turnos (alcanzó el límite de turnos); paso 2 con `test_passed=1.0`, reward 1.054 y 11 turnos. Estos datos reflejan la variabilidad esperable en un test de humo de tres pasos y no constituyen una señal de calidad del modelo. No se documenta composición del dataset, número de tokens de entrenamiento, ni uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base `thinkingmachines/Inkling-2-Mini`, no documentadas en detalle en la información disponible.
- Ejecución de bucles de herramientas: el checkpoint se validó contra el bucle `pi` y el grader Harbor, lo que implica soporte de interacción con herramientas en entornos tipo terminal.
- Modo de razonamiento configurable: el test se ejecutó con `thinking mode: none`, lo que sugiere que el modelo base soporta modos de razonamiento alternativos.
- Evaluación en entornos de terminal: el benchmark `terminal-bench-2.0` mide la capacidad de resolver tareas en una shell, con límite de turnos por episodio.
- Capacidades multilingües, de visión, audio o tool calling genérico: no disponibles en la información proporcionada.

## Casos de uso

- Validación de pipelines de entrenamiento: el caso de uso real del checkpoint es comprobar que la cadena Tinker (sesión, publicación de pesos, sampler) y el grader Harbor funcionan antes de lanzar runs más largos. Se usaría cargando el sampler y ejecutando un episodio corto sobre `terminal-bench-2.0`.
- Pruebas de integración del bucle de herramientas `pi`: sirve para verificar que el agente interactúa correctamente con la shell y que el conteo de turnos y el límite por episodio se respetan.
- Reproducción de resultados de infraestructura: al estar publicados los pesos y el sampler en Tinker, otra cuenta puede cargarlos y repetir el experimento de tres pasos para auditar la reproducibilidad del entorno.
- Desarrollo del proyecto PINGI: el checkpoint forma parte del repositorio GitHub del autor y puede emplearse como referencia de configuración LoRA (rango 32, atención + MLP + unembed, AdamW) para futuros ajustes.
- Docencia o demostración de flujos Tinker: permite ilustrar el ciclo completo de publicación y carga de checkpoints sin necesidad de descargar pesos localmente.
- No es adecuado para generación de código en producción, atención al cliente, agentes desplegados ni ninguna tarea de usuario final: el propio autor lo desaconseja explícitamente.

## Benchmarks y rendimiento

Resultados del smoke test sobre `terminal-bench-2.0` (thinking mode `none`):

| Paso | test_passed | reward | turnos / episodio |
|---:|---:|---:|---:|
| 0 | 1.0 | 1.015 | 12 |
| 1 | 0.0 | 0.0 | 15 (límite de turnos) |
| 2 | 1.0 | 1.054 | 11 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los tres pasos anteriores no constituyen una evaluación estadísticamente significativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no conocerse el tamaño del modelo base.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la inferencia documentada se realiza exclusivamente a través de Tinker (`tinker.ServiceClient` y `create_sampling_client` con la ruta del sampler). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la descarga de pesos está deshabilitada por el proveedor del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoría, y el carácter de smoke test del checkpoint hace que cualquier comparación de rendimiento con modelos de producción resulte engañosa.

## Limitaciones y advertencias

- No es un modelo terminado: el autor lo describe como un test de humo de tres pasos, no como un modelo de código listo para uso.
- Pesos no descargables: Thinking Machines deshabilita la descarga de ficheros para `Inkling-2-Mini` (`403 Checkpoint downloads are disabled`); el uso requiere cuenta en Tinker y las rutas `tinker://` publicadas.
- Resultados no significativos: con tres pasos y un fallo por límite de turnos, no hay evidencia de calidad sostenida.
- Sesgos y alucinaciones: no documentados para el modelo base en la información disponible; se heredan los del modelo `Inkling-2-Mini`, que no se detallan.
- Idiomas y contexto: sin datos; no se puede garantizar cobertura multilingüe ni ventanas de contexto concretas.
- Licencia Apache 2.0 declarada, pero su aplicabilidad efectiva queda condicionada por las restricciones de acceso y descarga impuestas por la plataforma Tinker y por los términos del modelo base.
- Para producción: no recomendado bajo ninguna circunstancia; usar únicamente como artefacto de validación de infraestructura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lyffseba/pingi-smo
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio GitHub del proyecto PINGI: https://github.com/lyffseba/pingi
- Hub principal PINGI: https://huggingface.co/lyffseba/pingi
- Space xai: https://huggingface.co/spaces/lyffseba/xai
- Consola Tinker: https://tinker-console.thinkingmachines.ai
- Pesos publicados: `tinker://e7bba24a-6366-5c8c-93b8-21e624a621a6:train:0/weights/final`
- Sampler publicado: `tinker://e7bba24a-6366-5c8c-93b8-21e624a621a6:train:0/sampler_weights/final`
