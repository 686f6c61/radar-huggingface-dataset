# 7son/axis-executor

## Resumen

El repositorio `7son/axis-executor` de Hugging Face no contiene un modelo de inteligencia artificial. Se trata de una publicación que distribuye un ejecutable para Windows 10/11 de 64 bits, empaquetado en un archivo ZIP protegido con contraseña, y cuya model card lo presenta como un "executor" con editor Monaco, compatibilidad con el entorno de scripts Luau y capacidades de inyección de scripts en procesos de cliente. No hay pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociados al repositorio.

La model card describe componentes propios de una herramienta de ejecución de scripts sobre clientes de escritorio (adjuntar procesos, hookmetamethod, getgc, Drawing API), no de un modelo lingüístico. Los enlaces de descarga apuntan a binarios alojados en repositorios de GitHub de terceros, y el propio paquete se entrega cifrado con la contraseña `2026`, un patrón habitual en la distribución de software potencialmente no deseado.

Por tanto, esta ficha documenta lo que el repositorio declara y advierte de que no es utilizable como modelo de IA: no existen parámetros, contexto, cuantizaciones ni licencia de pesos que evaluar. Cualquier uso del binario debe tratarse como la ejecución de software de procedencia dudosa, no como el despliegue de un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos; se aplica al contenido del repositorio, no a un modelo) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows, `4.8 MB`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card enumera funcionalidades de una aplicación de escritorio: editor Monaco con resaltado multi-pestaña, adjunción de procesos a clientes, compatibilidad declarada del 98 % con sUNC (hookmetamethod, getgc, Drawing API), hub de scripts integrado, adjunción multi-instancia y un flujo de ejecución "keyless". Menciona además 15 hilos de trabajo y un consumo declarado inferior a 64 MB de RAM.

No se aportan datos sobre conjuntos de entrenamiento, tokens, RLHF, DPO ni innovaciones de modelado. El binario se distribuye como `lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.exe` (build v3.5.1, 7791FB) dentro de un ZIP cifrado con la contraseña `2026`, alojado en repositorios de GitHub de terceros (`Hiroshis198/...` y `TaveqoXoz22/axis-executor`).

## Capacidades

- No es un modelo generativo: no produce texto, código, razonamiento ni matemáticas.
- No dispone de tool calling ni function calling en el sentido de un LLM.
- No implementa razonamiento multi-paso ni comportamiento de agente basado en lenguaje.
- Los idiomas listados en los metadatos corresponden a la ficha del repositorio, no a capacidades lingüísticas verificadas.
- Declara, según la model card, ejecución de scripts Luau, adjunción a procesos de cliente, editor Monaco y un hub de scripts con presets en la nube.
- No hay evidencia de vision, audio, thinking mode ni ninguna capacidad multimodal.

## Casos de uso

- No aplica: el artefacto no es un modelo de IA y no puede emplearse en tareas de generación, clasificación, extracción o razonamiento.
- Evaluación de seguridad defensiva: un equipo puede analizar el binario en un entorno aislado para determinar si el patrón de distribución (ZIP cifrado, contraseña pública, enlaces a repositorios de terceros) corresponde a software malicioso.
- Formación en concienciación: sirve como ejemplo documentado de model card que imita la estructura de un repositorio de modelos sin contener un modelo.
- Auditoría de cadena de suministro: permite ilustrar cómo verificar que un repositorio de Hugging Face no incluye pesos ni configuración antes de incorporarlo a un pipeline.
- No se recomienda ningún uso productivo del ejecutable en estaciones de trabajo corporativas ni en entornos con datos sensibles.
- Cualquier escenario de atención al cliente, generación de código o análisis documental queda fuera de alcance por ausencia total de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras de marketing (rating 5.0/5, 618K+ descargas, 281 Hz de sondeo, 96.3 % de consistencia multi-instancia), pero no son resultados de evaluación de un modelo y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no hay modelo que cargar.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados del ejecutable: Windows 10/11 de 64 bits, extracción completa del ZIP y ejecución como administrador según la model card.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card (281 Hz de sondeo, 15 hilos) no son medibles ni verificables como rendimiento de inferencia.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el repositorio no contiene un modelo. Frente a un LLM open source real, las diferencias son absolutas: no hay parámetros, contexto, pesos, tokenizador ni licencia de uso de modelo que comparar.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; tratarlo como tal es un error de categoría.
- Distribución mediante ZIP cifrado con contraseña pública y enlaces a repositorios de GitHub de terceros: patrón asociado con frecuencia a software no deseado o malicioso.
- La model card solicita ejecutar el binario como administrador, lo que amplía el impacto potencial de cualquier comportamiento malicioso.
- Los enlaces de descarga apuntan a cuentas distintas de la del autor del repositorio, lo que impide verificar la cadena de custodia del binario.
- No hay firmas, hashes ni análisis de malware publicados que permitan validar la integridad del ejecutable.
- Las cifras de descargas, valoración y rendimiento de la model card no son verificables y presentan formato de reclamo promocional.
- La licencia MIT declarada en los metadatos no garantiza derechos sobre el binario distribuido por terceros ni exime de responsabilidad por su uso.
- Riesgo de alucinación: no aplica como modelo; el riesgo real es de seguridad del software.
- No debe instalarse en entornos corporativos, académicos compartidos ni máquinas con credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/7son/axis-executor
- Repositorio de GitHub citado en la model card: https://github.com/TaveqoXoz22/axis-executor
- Repositorio de GitHub citado para la descarga: https://github.com/Hiroshis198/lossless-scaling-3-dlss4-unlocked-2026
- Paper: no disponible
- Blog o demo oficial: no disponible
