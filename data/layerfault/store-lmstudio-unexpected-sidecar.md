# LayerFault/store-lmstudio-unexpected-sidecar

## Resumen

Este repositorio, identificado como `LayerFault/store-lmstudio-unexpected-sidecar`, es un artefacto sintético del corpus de seguridad Layerfault, diseñado exclusivamente para probar detectores de escaneo de modelos de IA locales. No se trata de un modelo de lenguaje funcional, sino de un fichero de prueba con características adversariales (como opcodes de pickle sospechosos, contenedores de formato ejecutable y cadenas de inyección de prompt) que se utilizan para evaluar reglas de detección en herramientas de admisión de modelos. Fue creado el 21 de agosto de 2026 por el autor LayerFault y se distribuye bajo licencia Apache-2.0, aunque su uso está restringido a entornos aislados de pruebas de seguridad.

El propósito declarado en la model card es "Store lmstudio unexpected sidecar" (almacenar un sidecar inesperado de LM Studio), y se clasifica como un control positivo con severidad media y dificultad alta. No contiene pesos de modelo ni funcionalidad alguna de inferencia, por lo que no puede emplearse en ningún caso como modelo de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha entrenado ningún modelo. El repositorio contiene un artefacto sintético diseñado para simular un paquete de modelo local con características adversas. No hay arquitectura, ni datos de entrenamiento, ni proceso de RLHF o DPO. La model card indica que es un «test fixture» y que contiene «suspicious pickle opcodes, executable-format smuggling, prompt-injection strings» con el fin de ejercitar las reglas de detección de los escáneres de seguridad. No existe ninguna innovación técnica de IA.

## Capacidades

- No posee capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene funcionalidad multilingüe.
- Su única función es servir como entrada para pruebas de escaneo estático y comportamiento aislado en herramientas de seguridad (por ejemplo, Layerfault).

## Casos de uso

- Pruebas de detección de reglas en sistemas de admisión de modelos locales: el artefacto se utiliza como entrada para verificar que un escáner identifica y bloquea paquetes con características adversariales.
- Evaluación de blind spots en detectores de seguridad: al ser un caso positivo de severidad media y dificultad alta, permite comprobar si un detector implementa las reglas necesarias para bloquearlo.
- Entrenamiento de modelos de clasificación de seguridad: los datos sintéticos pueden usarse para ajustar heurísticas o modelos de detección de amenazas en repositorios de IA.
- Auditoría de pipelines de descarga de modelos: sirve para validar que un sistema de admisión rechaza artefactos no seguros antes de que lleguen a un runtime de inferencia.
- Investigación sobre técnicas de ocultación en modelos locales: el artefacto ejemplifica métodos de smuggling de formato y opcodes sospechosos, útil para análisis académico o defensivo.
- Control negativo en evaluaciones comparativas de escáneres: se puede incluir en un conjunto de pruebas para medir la tasa de falsos negativos de herramientas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no ser un modelo de IA, no aplica ningún estándar de rendimiento (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- No aplica: no es un modelo ejecutable.
- No requiere GPU, VRAM ni recursos de inferencia.
- Puede ser procesado por cualquier máquina con herramientas de análisis estático (por ejemplo, un escáner de seguridad) en un entorno aislado.
- No se recomienda su carga en vLLM, llama.cpp, Ollama ni TGI, ya que no contiene pesos válidos.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos equivalentes, al ser un artefacto de prueba sintético sin funcionalidad de IA.

## Limitaciones y advertencias

- **No es un modelo de IA**: no puede generar texto, razonar ni ejecutar ninguna tarea de inferencia.
- **Contiene características adversariales**: incluye opcodes de pickle sospechosos, contenedores de formato ejecutable y cadenas de inyección de prompt; cargarlo o ejecutarlo fuera de un entorno aislado de pruebas puede suponer un riesgo de seguridad.
- **Uso exclusivo en pruebas de seguridad**: la model card exige aceptar un aviso de gating que confirma que el usuario comprende que es un artefacto de prueba y no pesos de producción.
- **Licencia**: Apache-2.0 permite uso comercial, pero solo en el contexto de pruebas de seguridad y nunca como modelo de producción.
- **Sin garantías**: el corpus es sintético y no representa un modelo real; cualquier intento de utilizarlo como modelo de lenguaje será fallido.

## Enlaces

- HuggingFace: https://huggingface.co/LayerFault/store-lmstudio-unexpected-sidecar
- Proyecto Layerfault en GitHub: https://github.com/izm1chael/layerfault
- LM Studio (página oficial de modelos): https://model.lmstudio.ai/home
- Documentación de LM Studio para servidor local: https://lmstudio.ai/docs/developer/core/server
