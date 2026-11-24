# BobiBGGG/base-uniswap-v4-sniper-bot

## Resumen

El repositorio `BobiBGGG/base-uniswap-v4-sniper-bot` no contiene un modelo de inteligencia artificial. Se trata de un artefacto empaquetado como si fuera una ficha de Hugging Face, pero cuyo contenido real es una página de descarga de un supuesto ejecutable de Windows (`base-uniswap-v4-sniper-bot-v1.2.0-win64.zip`, 8,9 MB) alojado en un repositorio de GitHub de terceros (`heronfable/base-uniswap-v4-sniper-bot`). No hay pesos, tokenizador, configuración de arquitectura ni código de inferencia.

El texto de la model card describe un supuesto bot de trading de criptomonedas orientado a Uniswap V4 sobre la red Base, con módulos de enrutamiento de órdenes, bundling multi-cartera, copia de operaciones de ballenas y motor de bundles MEV. Toda esta descripción es material comercial del autor, no documentación técnica verificable de un modelo.

Desde la perspectiva de evaluación de modelos, el artefacto es irrelevante: no es un modelo de lenguaje, no tiene parámetros, contexto, licencia de pesos ni benchmarks. Su interés es exclusivamente como caso de estudio de riesgo en la cadena de suministro de software, ya que la "instalación" recomendada implica descargar un ZIP protegido con contraseña y ejecutar un binario con privilegios de administrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible; el artefacto distribuido es un ZIP con un `.exe` para Windows x64 |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El contenido del repositorio es una página de marketing que describe módulos funcionales de un supuesto bot de trading: enrutamiento de órdenes con latencia inferior a 40 ms, bundler de 20 carteras mediante Lookup Tables, copia de operaciones de "smart money", motor de bundles Jito/MEV, sandbox de paper trading y take profit multinivel. Ninguno de estos componentes se acompaña de código fuente, binarios verificables ni resultados reproducibles.

El artefacto se distribuye como un ZIP de 8,9 MB con contraseña (`2026`) que contiene un ejecutable `base-uniswap-v4-sniper-bot-v1.2.0-win64.exe` etiquetado como build `v2.9.7 (AB5DDC)`. La model card indica que debe ejecutarse "como administrador" en Windows 10/11 de 64 bits. No hay información sobre el lenguaje de implementación, dependencias, firma de código ni cadena de compilación.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso basado en un transformer.
- Las capacidades declaradas por el autor son las de un supuesto bot de trading: enrutamiento de órdenes, bundling multi-cartera, copia de operaciones, bundles MEV, paper trading y take profit automatizado. Ninguna de ellas está verificada ni respaldada por artefactos técnicos auditables.
- Multilingüismo: los metadatos listan 14 idiomas, pero corresponden a la localización de la página de descarga, no a capacidades del artefacto.

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA, ya que no lo es. Los escenarios que se describen a continuación son los que el autor declara, y se incluyen únicamente a efectos de evaluación crítica:

- Trading automatizado en Uniswap V4 sobre Base: el autor afirma enrutamiento de órdenes por debajo de 40 ms; no hay evidencia reproducible ni código que lo respalde.
- Bundling multi-cartera: se declara ejecución de 20 carteras en el mismo bloque mediante Lookup Tables; sin binario auditado no puede validarse.
- Copia de operaciones de ballenas: se describe un módulo de espejo de carteras con dimensionamiento proporcional; no se especifica fuente de datos ni lógica de dimensionamiento.
- Extracción MEV: se menciona un motor de bundles con tip dinámico; no se detalla la infraestructura de relay ni la red de validadores utilizada.
- Simulación de estrategias: se ofrece un sandbox de paper trading contra libros de órdenes en vivo; sin acceso al binario no puede comprobarse.
- Gestión de salidas: se declara take profit multinivel con trailing stop; no hay documentación de parámetros ni de gestión de riesgo.

Ninguno de estos casos debe considerarse una recomendación de uso. La ejecución de binarios de procedencia no verificada con privilegios de administrador constituye un riesgo de seguridad grave.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (latencia inferior a 40 ms, 304 Hz de sondeo, 99,3 % y 97,7 % de "consistencia") son afirmaciones del autor sin metodología, conjunto de datos ni condiciones de medida especificadas, por lo que no son comparables ni verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no es un modelo de IA.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Plataforma declarada por el autor: Windows 10/11 de 64 bits, ejecución como administrador.
- Latencia y throughput: no disponibles de forma verificable.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos de IA comparable, porque el artefacto no es un modelo. Como referencia de categoría, podría compararse con otros repositorios de Hugging Face que no contienen pesos, pero esa comparación queda fuera del alcance de esta ficha técnica.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, tokenizador, configuración ni código de inferencia. Cualquier evaluación como modelo es improcedente.
- La distribución se realiza mediante un ZIP protegido con contraseña alojado en un repositorio de GitHub de terceros, fuera de Hugging Face, lo que impide la verificación de integridad por parte de la plataforma.
- Se instruye a ejecutar un binario `.exe` con privilegios de administrador en Windows. Esta práctica es un vector clásico de malware, mineros, stealers de credenciales o ransomware.
- Las cifras de rendimiento y los badges de descargas y valoración de la model card no son verificables y presentan indicios de fabricación (por ejemplo, 654 000 descargas frente a 0 descargas registradas en Hugging Face).
- La licencia MIT declarada en los metadatos aplica, en su caso, al contenido del repositorio, no a un binario de terceros cuya procedencia y cadena de compilación se desconocen.
- Riesgo de fraude financiero: la temática de trading automatizado con criptomonedas es un señuelo habitual en campañas de distribución de software malicioso.
- No debe descargarse, extraerse ni ejecutarse el artefacto en entornos de producción ni en máquinas con credenciales o carteras de criptomonedas.
- No se han identificado sesgos de modelo, riesgo de alucinación ni limitaciones de contexto o idioma en el sentido habitual, porque no hay modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/BobiBGGG/base-uniswap-v4-sniper-bot
- Repositorio de GitHub referenciado por el autor: https://github.com/heronfable/base-uniswap-v4-sniper-bot
- Página de releases referenciada: https://github.com/heronfable/base-uniswap-v4-sniper-bot/releases/latest
- Enlace directo al ZIP referenciado (no recomendado): https://github.com/heronfable/base-uniswap-v4-sniper-bot/releases/latest/download/base-uniswap-v4-sniper-bot-v1.2.0-win64.zip
- Paper, blog o demo oficial: no disponible.
