# LayerFault/serialization-pickle-safe-global-control

## Resumen

Este repositorio es un artefacto sintético del corpus de seguridad LayerFault, diseñado específicamente para ejercitar reglas de detección de escáneres de seguridad en el ámbito de la deserialización de pickle. No se trata de un modelo de aprendizaje automático utilizable, sino de una "fixture" de prueba que contiene características adversarias deliberadas, como opcodes de pickle sospechosos, contrabando de formatos ejecutables y cadenas de inyección de prompts. Su propósito es servir como control negativo para validar que los escáneres no emiten falsos positivos ante contenido benigno.

El autor, LayerFault, lo clasifica como un elemento de control dentro de su corpus, con severidad informativa y dificultad básica. La model card advierte explícitamente de que no debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas de escáneres. No se dispone de arquitectura, parámetros, contexto ni ningún otro dato técnico propio de un modelo de ML, ya que no existe tal modelo.

La relevancia de este artefacto radica en el contexto más amplio de seguridad en el ecosistema de Hugging Face, donde la deserialización de pickle es un vector de ataque conocido (más de 2.100 millones de descargas mensuales de modelos pickle en el hub, según investigaciones recientes). Este tipo de corpus ayuda a calibrar herramientas de detección, aunque no ofrece ninguna capacidad de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo ML) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repositorio de 0.0 GB, sin pesos) |

## Arquitectura y entrenamiento

No aplica. Este repositorio no contiene un modelo de aprendizaje automático, sino un artefacto sintético de prueba de seguridad. Segun la model card, se trata de un elemento de control del corpus LayerFault, con ID `LF-CH-SER-0001`, construido deliberadamente para contener características relevantes para la seguridad (posibles opcodes de pickle sospechos, contrabando de formatos ejecutables, cadenas de inyeccion de prompts). No existe informacion sobre arquitectura, datos de entrenamiento ni proceso de optimizacion.

## Capacidades

- No aplica: el repositorio no ofrece ninguna capacidad de generacion de texto, razonamiento, codigo, vision u otras funciones propias de un modelo de lenguaje.
- Su unica funcion es servir como entrada de control para escaneres de seguridad, verificando que no se marque como peligroso (regla negativa `LF-PICKLE-DANGEROUS-GLOBAL`).
- No soporta tool calling, agentes, ni ningun tipo de interaccion conversacional.
- No tiene capacidades multilingues ni de vision o audio.

## Casos de uso

No aplica. Dado que no es un modelo utilizable, no existen casos de uso de aplicacion practica. Los unicos escenarios validos son:

- Prueba de regresion en escaneres de seguridad: verificar que un detector no emite falsos positivos ante un artefacto benigno.
- Calibracion de reglas de deteccion: ajustar umbrales de severidad para contenido pickle aparentemente inocuo.
- Evaluacion de herramientas de analisis estatico en pipelines de CI/CD para MLOps.
- Formacion de personal de seguridad en identificacion de artefactos de prueba frente a modelos reales.
- Auditoria de politicas de carga de modelos en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo ML, no existen metricas de rendimiento como MMLU, HumanEval o GSM8K. Los unicos datos relevantes son las reglas esperadas de la capa de seguridad: la regla negativa `LF-PICKLE-DANGEROUS-GLOBAL` debe permanecer silenciosa, y no hay reglas directas esperadas.

## Requisitos de hardware

No aplica. No hay inferencia posible, por lo que no se requieren recursos de computacion especificos. El unico entorno necesario es un sandbox aislado para pruebas de escaneo estatico. No se recomienda su despliegue en ningun sistema de produccion.

## Comparativa con modelos similares

No disponible. No existe una categoria comparable, ya que no es un modelo de lenguaje ni un modelo de vision. Los artefactos de seguridad del corpus LayerFault son unicos en su categoria de fixtures de prueba. No hay alternativas equivalentes en terminos de funcionalidad.

## Limitaciones y advertencias

- No es un modelo utilizable: contiene caracteristicas adversariales deliberadas y no debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas.
- Riesgo de ejecucion de codigo malicioso: la model card advierte de opcodes de pickle sospechosos y contrabando de formatos ejecutables.
- Riesgo de inyeccion de prompts: el contenido puede incluir cadenas de inyeccion que podrian comprometer sistemas no aislados.
- No apto para uso comercial ni para integracion en aplicaciones reales.
- La licencia apache-2.0 no elimina los riesgos inherentes al contenido adversarial.
- No hay soporte tecnico ni garantias de funcionamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LayerFault/serialization-pickle-safe-global-control
- Paper PickleBall (seguridad en deserializacion de pickle): https://arxiv.org/html/2508.15987v1
- Version 2 del paper PickleBall: https://arxiv.org/html/2508.15987v2
- PDF PickleBall (CCS 2025): https://www.cs.columbia.edu/~junfeng/papers/pickleball-ccs25.pdf
- Blog PickleBall (davisjam): https://davisjam.medium.com/pickleball-secure-deserialization-of-pickle-based-machine-learning-models-a089113e6b0f
- Blog sobre deserializacion insegura en MLOps: https://kaden-projects.com/blog/unsafe-pickle-deserialization-mlops-model-registry-rce/
