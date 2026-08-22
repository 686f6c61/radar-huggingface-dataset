# LayerFault/provenance-missing-declared-file

## Resumen

El repositorio `LayerFault/provenance-missing-declared-file` no contiene un modelo de IA utilizable, sino un artefacto sintético de prueba de seguridad perteneciente al corpus Layerfault, identificado como `LF-CH-PROV-0003`. Lo desarrolla LayerFault con el propósito de ejercitar detectores de seguridad en escáneres de modelos, incluyendo características adversariales deliberadas como opcodes de pickle sospechosos, contrabando de formatos ejecutables y cadenas de inyección de prompts. La model card advierte explícitamente que no debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas.

El artefacto está diseñado como un caso de control positivo para evaluar la integridad de procedencia (provenance-integrity) en sistemas de admisión de modelos, con severidad media y dificultad alta. El peso almacenado en formato safetensors contiene 16 parámetros, lo que confirma su naturaleza de fixture de prueba y no de modelo funcional. Su relevancia actual radica en que sirve para validar herramientas de escaneo de seguridad en pipelines de despliegue de IA local, como el propio proyecto LayerFault de admisión de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de prueba, no modelo funcional) |
| Parametros totales | 16 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento en este repositorio. Se trata de un artefacto de prueba sintético diseñado para contener características adversariales (opcodes pickle, contrabuelo de formatos ejecutables, cadenas de inyección de prompts) que permitan ejercitar reglas de detección en escáner de seguridad. La model card indica que es un "control/comparison input" dentro del corpus Layerfault, sin reglas esperadas directas ni reglas candidatas declaradas. Su propósito es servir como prueba de control positivo para la detección de ficheros declarados ausentes en la verificación de procedencia.

## Capacidades

- No es un modelo generativo: no genera texto, código, ni razonamiento.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- Su única función es actuar como fixture de prueba para escáner de seguridad de modelos.
- Contiene características adversariales deliberadas (opcodes pickle sospechosos, contrabuelo de ejecutables, inyección de prompts) para validar reglas de detección.
- Se clasifica con severidad media, dificultad alta, y admisión esperada de tipo BLOCK en escáner de modelos.

## Casos de uso

- Pruebas de regresión de escáner de seguridad: se puede usar como entrada de control positivo para verificar que un detector de modelos de HuggingFace identifica correctamente artefactos con fuga de procedencia declarada.
- Validación de pipelines de admisión de modelos: integrar el artefacto en un pipeline CI/CD de admisión de modelos para confirmar que la herramienta de capa de seguridad bloquea repositorios con características adversariales.
- Evaluación de detectores de inyección de prompts: las cadenas de inyección incluidas permiten comprobar si un escáner las identifica en metadatos de model card.
- Pruebas de integridad de procedencia: el corpus está diseñado para ejercitar reglas de verificación de ficheros declarados ausentes, por lo que sirve para testear la detección de este tipo de fuga en repositorios.
- Entrenamiento de modelos de clasificación de seguridad: los datos sintéticos del corpus Layerfault pueden servir para entrenar o calibrar clasificadores de riesgo de repositorios de modelos.
- Auditoría de herramientas de admisión de modelos: permite comparar el comportamiento de distintos escáneres (por ejemplo, Layerfault frente a alternativas) ante un mismo artefacto de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba de seguridad y no de un modelo de IA, no procede evaluar métricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No requiere VRAM ni GPU para su uso: es un artefacto de datos estáticos para pruebas de escaneo.
- Puede procesarse en cualquier máquina con capacidad para ejecutar herramientas de análisis estático de modelos (por ejemplo, las integradas en Layerfault).
- No es desplegable en vLLM, llama.cpp, Ollama ni TGI, ya que no contiene pesos de modelo funcionales.
- El uso previsto es en entornos aislados de pruebas de seguridad, no en servidores de inferencia.

## Comparativa con modelos similares

No disponible. Este artefacto pertenece a un corpus sintético de pruebas de seguridad sin comparables directos en cuanto a modelos de IA. En el ámbito de herramientas de procedencia de modelos, el proyecto Layerfault en GitHub (izm1chael/layerfault) ofrece funcionalidades de verificación de integridad y procedencia para modelos locales, pero no es un modelo comparable.

## Limitaciones y advertencias

- No es un modelo utilizable: no contiene pesos de red neuronal funcionales y no puede generar ninguna salida.
- Riesgo de seguridad: contiene características adversariales deliberadas (opcodes pickle sospechosos, contrabuelo de ejecutables, inyección de prompts) que pueden activar cargas maliciosas si se intenta cargar o ejecutar fuera de un entorno aislado.
- Prohibido en producción: la model card advierte explícitamente que no debe cargarse ni ejecutarse fuera de un entorno de pruebas de escáner.
- Sin garantías de utilidad: no hay documentación de rendimiento, ni benchmarks, ni capacidades funcionales.
- Licencia apache-2.0 pero con uso restringido a pruebas de seguridad: aunque la licencia es permisiva, el propósito declarado limita su uso a testing de escáner.
- No hay idiomas soportados ni contexto definido.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/LayerFault/provenance-missing-declared-file
- Proyecto Layerfault en GitHub: https://github.com/izm1chael/layerfault
- Documentación de fuentes de Layerfault: https://github.com/izm1chael/layerfault/blob/main/docs/SOURCES.md
- Paper sobre procedencia de modelos (contexto de seguridad): https://arxiv.org/html/2410.02230v1
- Paper sobre pruebas de procedencia de modelos (contexto de seguridad): https://arxiv.org/abs/2502.00706
