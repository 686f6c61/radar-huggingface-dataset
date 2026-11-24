# Ilyass07/13-days-to-escape-script

## Resumen

El repositorio `Ilyass07/13-days-to-escape-script` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuible para Windows x64 (un ejecutable y un archivo ZIP) que la model card presenta como una herramienta de tipo *game cheat* orientada al juego "13 Days To Escape". El contenido incluye instrucciones para descargar un ZIP de 8,9 MB, extraerlo con la contraseña `2026` y ejecutar un binario como administrador, junto con referencias a funciones de memoria, escaneo de offsets y filtros de objetos.

No hay pesos, arquitectura de red neuronal, tokenizador ni pipeline de inferencia asociados. La etiqueta `license:mit` y el listado de idiomas (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) provienen de los metadatos del repositorio, pero no describen capacidades lingüísticas de un modelo, sino la localización de la página de distribución. El pipeline figura como no disponible, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

Por tanto, esta ficha documenta un artefacto de software potencialmente malicioso o no verificado, no un modelo open source evaluable. Cualquier uso en producción, investigación o despliegue de IA queda fuera de su ámbito. Se recomienda tratar el binario y el ZIP como no confiables y no ejecutarlos en entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; no implica capacidades lingüísticas del artefacto) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP de 8,9 MB con un `.exe` para Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. El repositorio describe un ejecutable `13-days-to-escape-script-v1.2.0-win64.exe` (build `v4.6.7`, identificador `EF02F5511F`) empaquetado en `13-days-to-escape-script-v1.2.0-win64.zip`. La model card menciona componentes como un núcleo externo en modo usuario, escaneo dinámico de offsets, perfiles JSON con intercambio en caliente, suavizado de entrada Bézier, radar 2D con filtro de objetos y una tecla de pánico (`END`) para descargar el proceso.

No se documentan datos de entrenamiento, número de tokens, composición del dataset, RLHF, DPO ni innovaciones de inferencia. La terminología empleada (offsets, punteros, inyección en memoria, hooks) corresponde a técnicas de manipulación de procesos, no a aprendizaje automático. La página incluye además indicaciones para desactivar o sortear alertas de Windows Defender y SmartScreen, lo que constituye una señal de riesgo relevante.

## Capacidades

- No ofrece generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta *tool calling* ni *function calling*.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un modelo de lenguaje.
- El artefacto declara funciones de manipulación de memoria de otro proceso, escaneo de offsets y filtrado de objetos dentro de un juego.
- Incluye un mecanismo de salida rápida mediante tecla de pánico.

## Casos de uso

- No procede: el artefacto no es un modelo de IA y no tiene aplicaciones legítimas de procesamiento de lenguaje, visión o razonamiento.
- Auditoría de seguridad: analizar el binario en un entorno aislado para determinar su comportamiento real, sus llamadas al sistema y posibles indicadores de compromiso.
- Investigación de malware: estudiar las técnicas de evasión descritas (contraseña en el ZIP, instrucciones para evitar Defender y SmartScreen) como ejemplo de ingeniería social.
- Formación en ciberseguridad: usar la model card como caso práctico de repositorios que suplantan la distribución de software legítimo en plataformas de modelos.
- Gestión de riesgos de cadena de suministro: incorporar este tipo de repositorios a listas de bloqueo y a políticas de revisión de artefactos descargados.
- Respuesta a incidentes: si un usuario ha ejecutado el binario, aplicar procedimientos de contención, análisis forense y rotación de credenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Sistema operativo declarado: Windows 10/11 de 64 bits, sobre procesadores Intel o AMD x64.
- VRAM: no aplica; no hay inferencia de modelos.
- GPU recomendadas: no aplicable.
- Ejecución en GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables.
- Consumo declarado: menos de 59 MB de RAM según la model card.
- Latencia y throughput: no disponibles; las cifras de la model card (por ejemplo, 96,3 % de consistencia en la descarga por tecla de pánico) no son verificables ni equivalentes a métricas de inferencia.

## Comparativa con modelos similares

| Criterio | `Ilyass07/13-days-to-escape-script` | Modelo de lenguaje open source típico | Herramienta legítima de accesibilidad o automatización |
|---|---|---|---|
| Naturaleza | Ejecutable para Windows con funciones de manipulación de procesos | Pesos y código de inferencia | Software con documentación y código auditable |
| Parámetros | no disponible | Miles de millones, según el modelo | no aplicable |
| Contexto | no disponible | Decenas de miles de tokens, según el modelo | no aplicable |
| Licencia | MIT declarada en metadatos | MIT, Apache 2.0, etc. | Variable |
| Verificabilidad | Baja: binario cerrado, contraseña en el ZIP, avisos de Defender | Alta: pesos y código publicados | Alta |
| Uso recomendado | Ninguno en producción | Evaluación e integración en aplicaciones | Automatización legítima |

No se identifican modelos comparables porque el artefacto no pertenece a la categoría de modelos de IA.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con métricas de calidad, sesgo o alucinación propias de un modelo de lenguaje.
- El binario se distribuye compilado y protegido con contraseña, lo que impide inspeccionar su contenido antes de la ejecución.
- La model card incluye instrucciones para sortear Windows Defender y SmartScreen, una práctica habitual en la distribución de software no deseado.
- Los enlaces de descarga apuntan a un repositorio de GitHub (`Silva52281/13-days-to-escape-script`) distinto del propietario del repositorio en Hugging Face, lo que dificulta la trazabilidad.
- Las cifras de descargas, valoración y consistencia que aparecen en la model card no están verificadas y no deben tomarse como evidencia.
- La licencia MIT declarada no garantiza la legalidad ni la seguridad del artefacto; el uso de herramientas de trampa en juegos puede infringir los términos de servicio de las plataformas.
- Riesgo alto de malware, robo de credenciales o persistencia no declarada si se ejecuta el binario.
- No debe desplegarse en entornos de producción, investigación ni sistemas personales sin un análisis previo en un entorno aislado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ilyass07/13-days-to-escape-script
- Repositorio de GitHub citado en la model card: https://github.com/Silva52281/13-days-to-escape-script
- Página de releases citada: https://github.com/Silva52281/13-days-to-escape-script/releases/latest
- Descarga directa citada (no recomendada): https://github.com/Silva52281/13-days-to-escape-script/releases/latest/download/13-days-to-escape-script-v1.2.0-win64.zip
