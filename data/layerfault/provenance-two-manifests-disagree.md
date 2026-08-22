# LayerFault/provenance-two-manifests-disagree

## Resumen

Este repositorio es un artefacto sintetico de prueba de seguridad perteneciente al corpus LayerFault, un proyecto de validacion local de modelos de IA. No contiene un modelo de aprendizaje automatico utilizable, sino un fichero de pesos `safetensors` de 16 parametros disenado para ejercitar los detectores de escaneres de seguridad. El identificador del corpus es `LF-CH-PROV-0007` y su proposito declarado es servir como control para probar reglas de deteccion de integridad de procedencia (provenance-integrity).

El repositorio se describe explicitamente como un "SECURITY TEST ARTIFACT" que no debe usarse como modelo de produccion. Incluye caracteristicas adversariales deliberadas, como opcodes de pickle sospechosos, contrabando de formatos ejecutables y cadenas de inyeccion de prompts, disenadas para ejercitar reglas de deteccion en herramientas de escaneo. El acceso al repositorio esta restringido mediante una puerta de aceptacion que requiere confirmar que se comprende que es un arn de prueba, no pesos de produccion.

La relevancia de este repositorio reside en su uso como caso de control positivo para herramientas de admision de modelos, como el propio proyecto LayerFault, que valida artefactos y runtimes locales antes de la inferencia. No tiene aplicacion directa para desarrolladores que buscan un modelo de IA funcional, sino para equipos de seguridad que mantienen pipelines de escaneo de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo funcional) |
| Parametros totales | 16 |
| Parametros activos | no aplicable |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No existe una arquitectura de modelo en este repositorio. Los 16 parametros en formato `safetensors` no constituyen una red neuronal entrenada, sino un artefacto sintetico generado para pruebas de escaneo. Segun la model card, el repositorio contiene caracteristicas adversariales deliberadas, como opcodes de pickle sospechosos, contrabando de formato ejecutable y cadenas de inyeccion de prompts, todas ellas disenadas para activar reglas de deteccion de herramientas de seguridad. No hay datos de entrenamiento, proceso de ajuste o innovacion tecnica que documentar.

## Capacidades

- No es un modelo de IA utilizable: no genera texto, codigo ni realiza inferencias.
- Funciona como una prueba de deteccion: contiene caracteristicas adversariales para ejercitar reglas de escaneo.
- Incluye opcodes de pickle sospechosos, contrabando de formato ejecutable y cadenas de inyeccion de prompts.
- Su clasificacion de desafio es: severidad media, dificultad intermedia, tipo de control positivo.
- Superficie de ataque: integridad de procedencia (provenance-integrity).
- Tecnicas de prueba: dos manifiestos en desacuerdo.

## Casos de uso

- Pruebas de regresion de escaneres de seguridad: este repositorio sirve como entrada de control positivo para validar que un escaner de modelos detecta correctamente artefactos con problemas de procedencia.
- Evaluacion de pipelines de admision de modelos: herramientas como LayerFault pueden usar este archivo para verificar que su proceso de validacion marca el artefacto como sospechoso (WARN) antes de cualquier ejecucion.
- Auditoria de herramientas de inspeccion de formatos: para comprobar que un analizador de `safetensors` detecta anomalias estructurales en los pesos.
- Pruebas de deteccion de inyeccion de prompts: para verificar que un escaner identifica cadenas de inyeccion embebidas en los metadatos del modelo.
- Verificacion de integridad de manifiestos: para comprobar que la herramienta detecta discrepancias entre dos manifiestos de procedencia.
- Entrenamiento de detectores de modelos adversariales: para calibrar umbrales de deteccion en entornos de investigacion de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no es un modelo de datos y no tiene rendimiento que evaluar.

## Requisitos de hardware

- No requiere GPU ni VRAM para su funcionamiento, ya que no es un modelo ejecutable.
- Puede procesarse con cualquier CPU para inspeccion estatica.
- El tamano del repositorio es de 0.0 GB, por lo que no requiere almacenamiento significativo.
- No es compatible con runtimes de inferencia como vLLM, llama.cpp, Ollama o TGI.
- Unico despliegue posible: en un entorno aislado de escaneo de seguridad.

## Comparativa con modelos similares

No disponible. Este repositorio no pertenece a ninguna categoria de modelos de IA comparable. Su funcion es ser un artefacto de prueba de seguridad, no un modelo de inferencia.

## Limitaciones y advertencias

- No es un modelo de IA utilizable: cualquier intento de cargarlo o ejecutarlo fuera de un entorno de pruebas aislado es un riesgo de seguridad.
- Contiene caracteristicas adversariales deliberadas: opcodes de pickle sospechosos, contrabando de formato ejecutable y cadenas de inyeccion de prompts.
- Riesgo de ejecucion de codigo malicioso: si se carga en un entorno no aislado, podria ejecutar codigo no seguro.
- Licencia apache-2.0: permite uso comercial, pero el aviso del autor exige que se use solo en entornos de escaneo aislado.
- No es un modelo de produccion: no debe usarse en ningun pipeline de inferencia.
- La clasificacion de riesgo es media (WARN) segun el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LayerFault/provenance-two-manifests-disagree
- Proyecto Layerfault (CLI de validacion): https://github.com/izm1chael/layerfault
- Documento de modelo de confianza de Layerfault: https://github.com/izm1chael/layerfault/blob/main/docs/TRUST_MODEL.md
- Articulo sobre pruebas de procedencia de modelos LLM: https://arxiv.org/html/2502.00706v1
- Protocolo de procedencia para agentes de IA: https://provenanceprotocol.org/
- Documentacion de procedencia de contenido en Azure AI: https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/content-understanding/provenance-disclosure
