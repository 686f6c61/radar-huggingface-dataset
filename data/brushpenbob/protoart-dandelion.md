# brushpenbob/protoart-dandelion

## Resumen

ProtoArt Dandelion no es un modelo de inteligencia artificial, sino una aplicacion de escritorio para macOS publicada en Hugging Face bajo el identificador `brushpenbob/protoart-dandelion`. Se trata de una utilidad de limpieza y mantenimiento del sistema (Smart Scan, Cleanup, Uninstaller, Space Lens, Large Files, Maintenance, Login Items y monitor de barra de menus) desarrollada con SwiftUI y distribuida como binario universal para Apple Silicon e Intel.

El repositorio no contiene pesos de ningun tipo: el tamano del repo es de 0.0 GB y las etiquetas (`macos`, `swiftui`, `utility`) confirman que se trata de software de aplicacion, no de un modelo entrenado. No hay pipeline declarado, no hay idiomas declarados y no se han publicado descargas ni interacciones. La relevancia de esta ficha es, por tanto, documental: sirve para dejar constancia de que este identificador no corresponde a un modelo evaluable y para evitar confusiones en busquedas de modelos.

La licencia declarada es Apache-2.0 y el autor mantiene el codigo fuente y las notas de version en un repositorio de GitHub externo. Cualquier evaluacion de capacidades de IA, benchmarks o requisitos de inferencia carece de sentido en este caso y se marca como no disponible a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (aplicacion de escritorio SwiftUI; no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (la model card esta redactada en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (se distribuye un `.dmg` universal: `ProtoArt-Dandelion-1.0.0-beta3.dmg`) |

## Arquitectura y entrenamiento

No aplica. El artefacto publicado es una aplicacion nativa de macOS construida con SwiftUI, empaquetada como imagen de disco universal (Apple Silicon + Intel) y compatible con macOS 14 o superior. No existe proceso de entrenamiento, dataset, tokenizador ni pesos neuronales asociados.

La unica innovacion tecnica documentada por el autor es de tipo operativo: la aplicacion no realiza conexiones de red ni envia telemetria, y requiere permisos de Full Disk Access y App Management para limpiar datos de otras aplicaciones y desinstalar software instalado con privilegios de administrador. El binario incluye un hash SHA-256 publicado (`2ee45d7e0741b5325abc4bc4e2178623f5bfba059284ea39c2d579b905739d79`) y no esta notarizado, por lo que en el primer arranque debe abrirse desde Ajustes del Sistema → Privacidad y seguridad → Abrir igualmente.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues evaluables.
- Funcionalidades reales de la aplicacion, segun la model card:
  - Smart Scan y Cleanup de archivos temporales y residuales.
  - Uninstaller de aplicaciones.
  - Space Lens para visualizar el uso de disco.
  - Deteccion de Large Files.
  - Tareas de Maintenance del sistema.
  - Gestion de Login Items.
  - Monitor en la barra de menus.
  - Funcionamiento completamente offline, sin telemetria.

## Casos de uso

- Limpieza de disco en equipos de desarrollo: la funcion Cleanup y Space Lens permite localizar y eliminar caches y archivos residuales que ocupan espacio en maquinas con entornos virtuales y contenedores de build.
- Desinstalacion completa de aplicaciones: el Uninstaller elimina la aplicacion y sus datos asociados, util en estaciones de trabajo donde se instalan y retiran herramientas con frecuencia.
- Auditoria de espacio antes de una migracion: Large Files y Space Lens ayudan a identificar que ocupa disco antes de clonar o migrar un Mac a otro equipo.
- Gestion de elementos de arranque: Login Items permite revisar y desactivar procesos que se inician con la sesion, reduciendo el consumo en reposo.
- Monitorizacion ligera en segundo plano: el monitor de barra de menus ofrece visibilidad del estado del sistema sin abrir aplicaciones adicionales.
- Despliegue en entornos con requisitos de privacidad: al no realizar conexiones de red ni enviar telemetria, encaja en equipos con politicas estrictas de tratamiento de datos.
- Mantenimiento preventivo en flotas de Mac: al ser Apache-2.0 y de codigo abierto, un equipo de IT puede auditar el binario y el codigo fuente antes de distribuirlo internamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo; no ejecuta inferencia neuronal).
- GPU recomendadas: no aplica; funciona con el hardware grafico integrado del Mac.
- Compatibilidad de hardware: binario universal para Apple Silicon e Intel; requiere macOS 14 o superior.
- Opciones de despliegue: instalacion del `.dmg` (`ProtoArt-Dandelion-1.0.0-beta3.dmg`) y ejecucion como aplicacion nativa. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Permisos requeridos: Full Disk Access y App Management para las funciones de limpieza de datos de terceros y desinstalacion de aplicaciones instaladas con privilegios de administrador.

## Comparativa con modelos similares

| Producto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProtoArt Dandelion | Utilidad macOS (SwiftUI) | no aplica | no aplica | Apache-2.0 | Hugging Face y GitHub, version 1.0.0-beta3 |
| CleanMyMac | Utilidad macOS (propietaria) | no aplica | no aplica | Comercial | Distribucion directa |
| OnyX | Utilidad macOS (propietaria) | no aplica | no aplica | Gratuita, codigo cerrado | Distribucion directa |
| AppCleaner | Desinstalador macOS | no aplica | no aplica | Gratuita, codigo cerrado | Distribucion directa |

No existe comparativa posible con modelos de IA porque el artefacto no es un modelo. La comparacion se limita a utilidades de limpieza de macOS, y los datos de rendimiento de las alternativas no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier uso esperando generacion de texto, codigo o razonamiento fallara.
- La version publicada es una beta (`1.0.0-beta3`), con posibles fallos de estabilidad y cambios de comportamiento entre versiones.
- El binario no esta notarizado por Apple; requiere el proceso manual de "Abrir igualmente" en el primer arranque, lo que anade friccion en despliegues gestionados.
- Requiere permisos amplios (Full Disk Access y App Management), lo que implica un riesgo operativo si el binario no se verifica contra el SHA-256 publicado.
- Sin telemetria ni conexiones de red: no hay reporte automatico de errores ni actualizaciones automaticas documentadas.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion.
- No hay datos de idiomas soportados ni de localizacion de la interfaz.
- Cero descargas y cero interacciones en Hugging Face en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/brushpenbob/protoart-dandelion
- Codigo fuente y notas de version: https://github.com/theprotoart/protoart-dandelion
