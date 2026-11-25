# ddjingle/subnautica-2-bepinex-map-overlay-trainer

## Resumen

El repositorio `ddjingle/subnautica-2-bepinex-map-overlay-trainer` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuible para Windows x64 etiquetado como trainer y overlay de mapa para Subnautica 2 mediante BepInEx, con soporte declarado para Windows 10/11 de 64 bits y una licencia MIT. No se especifica ninguna arquitectura de red neuronal, parametros, contexto ni formato de pesos.

La model card publicada no describe capacidades de generacion de texto, vision ni razonamiento. En su lugar, presenta instrucciones de descarga de un archivo ZIP de 4,8 MB, un ejecutable denominado `pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.exe` y una contrasena de extraccion (`2026`). Esta discrepancia entre el nombre del repositorio y los artefactos enlazados, junto con la referencia a un supuesto bot de trading/sniper, es una senal clara de contenido ajeno a un modelo de IA.

Por tanto, esta ficha no puede evaluar el artefacto como modelo de lenguaje ni como modelo de aprendizaje automatico. Los campos tecnicos habituales se marcan como no disponibles y se advierte explicitamente sobre los riesgos de seguridad asociados a la ejecucion de binarios de origen no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto descrito es un ZIP con un ejecutable de Windows) |

## Arquitectura y entrenamiento

No disponible. No existe informacion sobre arquitectura de red, datos de entrenamiento, tokens procesados, tecnicas de alineacion (RLHF, DPO) ni innovaciones de inferencia. El contenido del repositorio describe un supuesto trainer/overlay para un videojuego y un binario para Windows, no un modelo entrenado.

## Capacidades

- No se documentan capacidades de generacion de texto, codigo, matematicas ni vision.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- El unico contenido funcional descrito son supuestas funciones de overlay de mapa, auto-ejecucion de scripts y compatibilidad con APIs de scripting, sin verificacion tecnica.
- No se aporta evidencia de capacidades multilingues mas alla de las etiquetas de idioma en los metadatos.

## Casos de uso

- No se identifican casos de uso legitimos como modelo de IA, ya que el artefacto no es un modelo.
- Auditoria de seguridad: analizar el binario en un entorno aislado para determinar su comportamiento real antes de cualquier uso.
- Investigacion de cadena de suministro: revisar la discrepancia entre el nombre del repositorio, los enlaces de descarga y el contenido de la model card.
- Formacion en deteccion de amenazas: usar este caso como ejemplo de model card que imita patrones de repositorios legitimos para distribuir ejecutables.
- No se recomienda su uso en produccion, desarrollo de software ni pipelines automatizados.
- No se recomienda su uso en entornos de escritorio de usuarios finales sin analisis previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion de modelos (MMLU, HumanEval, GSM8K u otras), y los porcentajes mencionados en la model card (por ejemplo, 97,2 % o 98,6 % de consistencia) no corresponden a benchmarks verificables de IA.

## Requisitos de hardware

- No aplica VRAM para inferencia de un modelo de IA, ya que no hay pesos ni arquitectura.
- El artefacto descrito se presenta como ejecutable para Windows 10/11 de 64 bits, sin requisitos de GPU documentados.
- No se especifican GPU recomendadas (A100, H100, RTX 4090 u otras).
- No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- No se proporcionan datos de latencia ni throughput verificables.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos comparable, dado que el artefacto no es un modelo de IA. Cualquier comparacion con modelos de lenguaje, vision o multimodal seria inapropiada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; la model card describe la descarga de un ejecutable de Windows y un ZIP protegido con contrasena.
- Existe una discrepancia grave entre el nombre del repositorio (overlay de Subnautica 2) y el nombre del binario enlazado (`pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.exe`), lo que sugiere contenido no relacionado o potencialmente malicioso.
- La ejecucion de binarios de origen no verificado con privilegios de administrador supone un riesgo elevado de compromiso del sistema.
- La peticion de ejecutar como administrador y la contrasena fija en la documentacion son patrones habituales en campanas de distribucion de malware.
- La licencia MIT declarada no garantiza la seguridad ni la legitimidad del contenido distribuido.
- No se dispone de informacion sobre sesgos, alucinacion o limitaciones de contexto porque no aplica a un modelo de IA.
- Se desaconseja su descarga, extraccion o ejecucion en cualquier entorno, especialmente en produccion o en equipos con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ddjingle/subnautica-2-bepinex-map-overlay-trainer
- Enlace de descarga citado en la model card (no verificado, no recomendado): https://github.com/carlos7088/pump-fun-jito-bundler-sniper-bot-2026/releases/download/v1.2.0/pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card (no verificado): https://github.com/LukasBrown151/subnautica-2-bepinex-map-overlay-trainer/releases/latest
