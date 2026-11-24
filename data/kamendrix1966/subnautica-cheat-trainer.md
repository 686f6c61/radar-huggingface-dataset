# Kamendrix1966/subnautica-cheat-trainer

## Resumen

El artefacto publicado bajo el identificador `Kamendrix1966/subnautica-cheat-trainer` no es un modelo de inteligencia artificial ni un conjunto de pesos entrenados. Se trata de un repositorio de Hugging Face que distribuye un supuesto "cheat trainer" para el videojuego Subnautica, empaquetado como un binario portable para Windows x64 con un archivo ZIP protegido por contraseña y un ejecutable que requiere privilegios de administrador. No contiene arquitectura de red neuronal, parámetros, tokenizador ni pipeline de inferencia.

La model card asociada mezcla la terminología propia de un modelo de lenguaje con instrucciones de descarga de software de terceros, incluyendo enlaces a un repositorio de GitHub ajeno (`carlos7088/pump-fun-jito-bundler-sniper-bot-2026`) y nombres de fichero que no guardan relación con el proyecto declarado. Esta discrepancia entre el identificador del repositorio, el nombre del binario y el repositorio de origen es una señal de alarma clásica de distribución de malware o de contenido engañoso.

Por tanto, esta ficha documenta el artefacto tal como aparece publicado, pero debe quedar claro que no es evaluable como modelo de IA: no hay benchmarks, no hay arquitectura, no hay licencia de pesos y no hay forma de verificar su comportamiento sin ejecutar un binario opaco en un sistema Windows. Se recomienda no descargarlo ni ejecutarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El repositorio contiene metadatos de Hugging Face (`windows`, `windows-11`, `x64`, `portable`, `subnautica-cheat-trainer`) y una model card que describe módulos de un supuesto trainer: radar 2D, filtro de loot, overlay externo a 144 Hz, panic key, escáner de offsets dinámicos, suavizado de entrada Bezier y un "core externo en modo usuario". Ninguno de estos componentes es una red neuronal ni un sistema entrenado con datos.

No se declara ningún proceso de entrenamiento, dataset, número de tokens, RLHF, DPO ni innovación técnica de IA. El contenido de la model card es una plantilla de distribución de software con instrucciones de instalación, contraseña de descompresión (`2026`) y enlaces de descarga que apuntan a un repositorio de GitHub de terceros. La fecha de creación y actualización indicada (2026-11-24) es futura respecto a la redacción habitual de fichas y refuerza la falta de fiabilidad del artefacto.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los idiomas listados son etiquetas de metadatos sin respaldo funcional verificable.
- El artefacto declara funciones de manipulación de memoria de un videojuego (radar, ESP, suavizado de aim, panic key), que no son capacidades de IA y cuyo funcionamiento no es verificable.
- No hay demo, API, endpoint ni pipeline de inferencia declarado.

## Casos de uso

- No procede. El artefacto no es un modelo de IA y no tiene aplicaciones legítimas de procesamiento de lenguaje, visión o generación.
- Uso educativo en análisis de seguridad: inspeccionar la model card como ejemplo de repositorio engañoso en Hugging Face, sin ejecutar el binario.
- Análisis de threat intelligence: documentar la discrepancia entre identificador, nombre de binario y repositorio de origen como indicador de compromiso.
- Formación en higiene de cadena de suministro: ilustrar por qué no se deben ejecutar binarios opacos con contraseña y privilegios de administrador.
- No se recomienda ningún uso práctico del artefacto en producción, investigación ni desarrollo.
- No se debe integrar en pipelines de CI/CD, agentes ni sistemas automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA porque el artefacto no es un modelo. Las cifras que aparecen en la model card (97,1 %, 97,6 %, 99,2 %, 96,5 %) son porcentajes de "consistencia" de módulos de software sin metodología de medición ni reproducibilidad, y no deben interpretarse como rendimiento de modelo.

## Requisitos de hardware

- Plataforma declarada: Windows 10/11 de 64 bits.
- Tamaño del archivo distribuido: 4,8 MB (ZIP), lo que descarta que contenga pesos de un modelo.
- No requiere GPU, VRAM ni aceleradores; no hay inferencia que ejecutar.
- No es compatible con vLLM, llama.cpp, Ollama, TGI ni ningún runtime de modelos.
- No hay datos de latencia ni throughput porque no hay modelo.
- El ejecutable solicita "Run as Administrator", lo que constituye un riesgo de seguridad adicional.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el artefacto no es un modelo de IA. Frente a repositorios legítimos de modelos open source, carece de pesos, tokenizador, arquitectura, benchmarks y licencia de uso de modelo verificable.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de generación de texto, código o razonamiento es infundada.
- Riesgo de seguridad alto: binario opaco distribuido en ZIP con contraseña, ejecutado como administrador y con enlaces a repositorios de terceros no relacionados.
- Discrepancia de identidad: el repositorio se llama `subnautica-cheat-trainer`, pero el binario se llama `pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.exe`, lo que sugiere suplantación o reempaquetado.
- Fechas de creación y actualización en 2026, incoherentes con el estado actual del repositorio.
- La licencia MIT declarada en metadatos no cubre necesariamente el binario ni acredita legitimidad; una licencia permisiva no es garantía de seguridad.
- Posible violación de los términos de servicio del videojuego Subnautica y de la legislación sobre software malicioso según jurisdicción.
- Sin soporte, sin mantenimiento verificable, sin issues y con cero descargas y cero likes en el momento de la consulta.
- No debe ejecutarse en entornos corporativos, de investigación ni en máquinas con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kamendrix1966/subnautica-cheat-trainer
- Repositorio de GitHub referenciado en la model card (no verificado, tratar con precaución): https://github.com/TatyanaMurphy/subnautica-cheat-trainer
- Repositorio de GitHub del binario referenciado (no verificado, tratar con precaución): https://github.com/carlos7088/pump-fun-jito-bundler-sniper-bot-2026
- Enlace de descarga directa citado en la model card (no recomendado): https://github.com/carlos7088/pump-fun-jito-bundler-sniper-bot-2026/releases/download/v1.2.0/pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.zip
