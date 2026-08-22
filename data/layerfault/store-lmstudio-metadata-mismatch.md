# LayerFault/store-lmstudio-metadata-mismatch

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial utilizable, sino un artefacto sintetico de pruebas de seguridad perteneciente al corpus Layerfault. Su identificador interno es `LF-CH-STORE-0007` y su proposito declarado es ejercitar reglas de deteccion de escaneres de seguridad mediante caracteristicas adversariales deliberadamente insertadas, como opcodes de pickle sospechosos, contrabando de formatos ejecutables y cadenas de inyeccion de prompts.

El autor, LayerFault, lo clasifica como un elemento de control positivo para pruebas de escaner, con severidad media y dificultad intermedia. No se trata de pesos de modelo, ni de una arquitectura entrenada, ni de un componente desplegable. La model card advierte explicitamente de que nunca debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas de escaner. Su relevancia actual radica en que sirve como referencia para validar herramientas de seguridad en el ecosistema de LM Studio, donde los metadatos de los modelos locales pueden no coincidir con el contenido real del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de pruebas, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no contiene pesos; es un fixture sintetico) |

## Arquitectura y entrenamiento

No existe arquitectura ni proceso de entrenamiento. El repositorio es un artefacto de datos sinteticos generado por el corpus Layerfault, disenado para simular caracteristicas adversariales que un escaner de seguridad deberia detectar. La model card especifica que contiene secretos falsos, destinos de red `.invalid` o loopback, y salidas de marcador inofensivas. No se ha realizado ningun entrenamiento, ajuste ni inferencia sobre estos datos.

## Capacidades

- No es un modelo de lenguaje, vision ni multimodal. No genera texto, codigo ni razonamiento.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- Su unica funcion es servir como entrada de prueba para escaneres de seguridad estaticos, verificando si detectan metadatos inconsistentes en repositorios de modelos locales (en este caso, relacionados con LM Studio).
- Incluye caracteristicas adversariales como opcodes de pickle sospechosos, contrabando de formatos ejecutables y cadenas de prompt injection, destinadas a activar reglas de deteccion especificas.

## Casos de uso

- Validacion de escaneres de seguridad en repositorios de modelos: se usa como entrada de control para comprobar si una herramienta de analisis detecta la discrepancia entre los metadatos declarados y el contenido real del repositorio.
- Pruebas de regresion de detectores: al ser un artefacto de control positivo, permite verificar que un escaner no falla en silencio ante repositorios que aparentan ser modelos pero no lo son.
- Auditoria de pipelines de descarga de modelos: sirve para comprobar que los clientes de descarga (como LM Studio) validan la autenticidad y coherencia de los repositorios antes de procesarlos.
- Evaluacion de clasificadores de riesgo en plataformas de IA: permite probar si un sistema de moderacion etiqueta correctamente artefactos de severidad media como advertencia, sin bloquearlos por completo.
- Desarrollo de reglas de deteccion para formatos de contenedores: el caso `LF-FORMAT-CLAIM-MISMATCH` sugiere que se puede usar para entrenar o validar reglas que detecten discrepancias entre el formato declarado y el real del fichero.
- Pruebas de entornos aislados de ejecucion de modelos: aunque no debe ejecutarse, sirve para verificar que un sandbox impide la carga de codigo arbitrario proveniente de repositorios no confiables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este artefacto no es un modelo de IA y no tiene metricas de rendimiento, exactitud ni velocidad de inferencia.

## Requisitos de hardware

- No aplica. No requiere GPU, VRAM ni CPU para inferencia.
- No es un modelo desplegable ni ejecutable; cualquier intento de cargarlo en un runtime de IA (vLLM, llama.cpp, Ollama, TGI) fallaria o representaria un riesgo de seguridad.
- El unico entorno recomendado es un sandbox de analisis estatico, sin conexion de red y sin acceso a credenciales.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos comparables porque este repositorio no es un modelo de IA, sino un artefacto de pruebas de seguridad. Los repositorios de la misma categoria del corpus Layerfault (por ejemplo, otros elementos de la serie `LF-CH-STORE-*`) tienen el mismo proposito de testing, pero no se dispone de datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, ni arquitectura, ni puede generar resultados utiles. Cualquier intento de usarlo como modelo producira errores o comportamiento indefinido.
- Riesgo de seguridad grave: contiene caracteristicas adversariales (opcodes de pickle sospechosos, contrabando de formatos ejecutables, cadenas de prompt injection). Ejecutar o cargar este repositorio fuera de un entorno aislado de pruebas puede comprometer el sistema.
- No debe desplegarse en produccion: la model card lo prohibe explicitamente y lo clasifica como `DO NOT USE AS A PRODUCTION MODEL`.
- Sesgos y alucinaciones: no aplica, al no ser un modelo de lenguaje.
- Restricciones de licencia: la licencia apache-2.0 cubre el artefacto de prueba, pero no implica que el contenido sea seguro para uso general. El acceso esta gated (requiere aceptacion de los terminos de riesgo).
- Advertencia para integracion con LM Studio: el nombre del repositorio alude a un desajuste de metadatos en el almacen local de LM Studio; usarlo como entrada en esa herramienta puede activar advertencias de seguridad o fallos de carga, como se describe en la documentacion oficial de LM Studio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LayerFault/store-lmstudio-metadata-mismatch
- Documentacion de LM Studio: https://lmstudio.ai/docs
- Guia de gestion de modelos de LM Studio (DeepWiki): https://deepwiki.com/lmstudio-ai/docs/4.4-model-management-and-configuration
- Guia de solucion de errores de carga en LM Studio: https://markaicode.com/errors/lm-studio-model-load-failed-fix/
- Discusion en foros de Hugging Face sobre errores de LM Studio: https://discuss.huggingface.co/t/how-do-i-resolve-this-issue-in-lmstudio/175120
