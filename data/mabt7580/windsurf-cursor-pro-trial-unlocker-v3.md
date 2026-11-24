# Mabt7580/windsurf-cursor-pro-trial-unlocker-v3

## Resumen

`Mabt7580/windsurf-cursor-pro-trial-unlocker-v3` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face que, segun su propia model card, distribuye un ejecutable portable para Windows x64 (`monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.exe`, version declarada v4.6.6, build F4E182) empaquetado en un ZIP de 4,8 MB protegido con contrasena. El titulo y el contenido se presentan como un "unlocker" de la version de prueba de herramientas como Windsurf o Cursor, pero el artefacto real es un binario de terceros alojado en un repositorio de GitHub ajeno al autor del repositorio de Hugging Face.

El repositorio no contiene pesos, tokenizador, configuracion de arquitectura ni ningun artefacto propio de un modelo de lenguaje. Las etiquetas de Hugging Face (`windows`, `windows-11`, `x64`, `portable`) y la ausencia de pipeline confirman que se trata de un contenedor de software ejecutable, no de un modelo entrenado. Los campos de idioma (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) parecen describir los idiomas de la interfaz del supuesto programa, no capacidades linguisticas de un modelo.

La relevancia de esta ficha es, por tanto, exclusivamente como advertencia: el patron descrito (nombre de marca conocido + "pro trial unlocker" + ZIP con contrasena + enlace a un repositorio de GitHub de nombre no relacionado) coincide con tecnicas habituales de distribucion de software no verificado. No existe evidencia publica de que el binario realice lo que promete, y su ejecucion requiere privilegios de administrador sobre el sistema del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados como idiomas del repositorio, no del modelo) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni documentacion de arquitectura, datos de entrenamiento, proceso de alineacion (RLHF/DPO) o innovaciones tecnicas de inferencia. La model card describe, en su lugar, un supuesto runtime "telemetry-free" con aceleracion por GPU (CUDA, TensorRT, DirectML, OpenCL) y un consumo declarado inferior a 26 MB de RAM, cifras que no son verificables y que no corresponden a ningun artefacto de aprendizaje automatico.

El contenido de la model card mezcla elementos incoherentes entre si: el nombre del proyecto hace referencia a Windsurf y Cursor, mientras que el binario distribuido se denomina `monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.exe`, un nombre asociado a un supuesto trainer de un videojuego. Esta discordancia entre nombre, proposito declarado y artefacto entregado es una senal de alarma tecnica relevante.

## Capacidades

- No se documenta ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte declarado de agentes ni razonamiento multi-paso.
- No hay capacidades multilingues propias de un modelo; los codigos de idioma del repositorio no implican competencia linguistica.
- El unico "producto" descrito es un ejecutable de escritorio que, segun el autor, desbloquearia funciones de pago de aplicaciones de terceros, extremo no verificado.

## Casos de uso

- Evaluacion de riesgos de cadena de suministro: el repositorio sirve como caso de estudio para analizar patrones de publicacion de binarios no verificados en plataformas de modelos, incluyendo el uso de nombres de marca ajenos y contrasenas en el archivo comprimido.
- Formacion en seguridad para equipos de desarrollo: permite ejemplificar por que no debe ejecutarse como administrador un binario descargado de un repositorio sin reputacion ni firma de codigo.
- Auditoria de repositorios en Hugging Face: util para calibrar filtros que detecten repositorios sin pesos ni configuracion de modelo pero con etiquetas propias de modelos.
- Analisis de politicas de licencia: ejemplo de como una licencia MIT declarada en metadatos no aporta garantias sobre el contenido real distribuido.
- Investigacion de tecnicas de ingenieria social: el texto de la model card (insignias de descargas, valoraciones, contrasena) ilustra patrones de persuasion dirigidos a usuarios no tecnicos.
- Documentacion de incidentes: registro de referencia para comparar futuros repositorios con caracteristicas similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (99,1 % de consistencia, 97,1 % de consistencia, menos de 16 ms de respuesta) no corresponden a ninguna metrica estandar de evaluacion de modelos y no son verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica. La model card menciona CUDA, TensorRT, DirectML y OpenCL sin especificar modelos ni versiones de controlador.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto es un ejecutable de Windows, no un modelo servible.
- Sistema operativo declarado: Windows 10/11 de 64 bits (x64), con requisito de ejecucion como administrador.
- Latencia y throughput: no disponibles ni aplicables al uso como modelo.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo de IA. La comparacion con otros repositorios de la misma naturaleza (distribucion de ejecutables no verificados) queda fuera del alcance de esta ficha.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de lenguaje ni pesos; tratarlo como tal en un pipeline de IA es un error de clasificacion.
- El binario distribuido se aloja en un repositorio de GitHub de un usuario distinto al autor del repositorio de Hugging Face, lo que impide verificar la cadena de custodia.
- La ejecucion requiere privilegios de administrador y no se documenta firma de codigo ni hash de verificacion publicado de forma independiente.
- El nombre del ejecutable no guarda relacion con el proposito declarado, lo que sugiere reutilizacion de artefactos ajenos o suplantacion.
- La licencia MIT declarada en los metadatos no garantiza derechos sobre el contenido distribuido ni exime de responsabilidad legal al usuario.
- El uso de nombres de marca de terceros (Windsurf, Cursor) sin autorizacion puede constituir infraccion de marca y de los terminos de servicio de dichos productos.
- No hay evidencia publica de que el programa realice la funcion que promete; el riesgo de software malicioso (robo de credenciales, persistencia, mineria) no puede descartarse.
- No se han publicado resultados de evaluacion independiente, auditoria de codigo ni informes de analisis dinamico.
- Recomendacion tecnica: no ejecutar el binario en entornos de produccion ni en maquinas con credenciales validas; si se analiza, hacerlo en una maquina virtual aislada y sin red.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mabt7580/windsurf-cursor-pro-trial-unlocker-v3
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/martina1713/monster-hunter-wilds-trainer-mod-2026/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card: https://github.com/EdwardScholz/windsurf-cursor-pro-trial-unlocker-v3/releases/latest
- Paper, blog, demo o documentacion oficial del modelo: no disponible
