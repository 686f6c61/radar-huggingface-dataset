# Redin/gmgn-bullx-photon-copytrade-bot-keyless

## Resumen

`Redin/gmgn-bullx-photon-copytrade-bot-keyless` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face que distribuye un ejecutable portable para Windows (`gmgn-bullx-photon-copytrade-bot-keyless-v1.2.0-win64.exe`, empaquetado en un ZIP de 8,9 MB) presentado por su autor como un bot de copytrading para plataformas de tokens en Solana (GMGN, BullX, Photon). No contiene pesos, tokenizador, configuración de arquitectura ni artefactos de inferencia de ningún tipo.

El artefacto se publica con licencia MIT y etiquetas de idioma (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id), pero estas etiquetas describen los idiomas de la documentación del binario, no capacidades lingüísticas de un modelo. El repositorio no declara pipeline de Hugging Face, no tiene descargas ni interacciones registradas y fue creado y actualizado el mismo día (24 de noviembre de 2026).

Desde el punto de vista de evaluación de IA open source, este repositorio queda fuera del ámbito de la ficha: no hay modelo que analizar. Lo relevante aquí es la advertencia de seguridad: la distribución de binarios ejecutables mediante repositorios de modelos, con contraseña de descompresión fija y enlaces a un repositorio de GitHub de terceros, es un patrón habitual en campañas de malware y fraude financiero. Se recomienda no ejecutar el binario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las etiquetas de idioma describen la documentación del binario, no capacidades de modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; tamaño declarado 8,9 MB) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado, ni datos de entrenamiento, ni proceso de ajuste (RLHF, DPO u otros). El contenido es un binario compilado para Windows 10/11 de 64 bits, con un instalador descrito en la model card mediante instrucciones de descompresión con contraseña fija (`2026`) y ejecución como administrador.

La model card describe funcionalidades del binario (filtro anti-honeypot previo a la compra, motor de bundles Jito/MEV, almacén local AES-256 de claves, bundler de 20 wallets con Lookup Tables, sandbox de paper trading y enrutado de órdenes de menos de 40 ms). Estas afirmaciones no son verificables y no constituyen especificaciones técnicas de un modelo. No hay información sobre arquitectura, dataset ni innovaciones de inferencia.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No dispone de tool calling ni function calling en el sentido de un modelo de IA.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües de modelo; los idiomas listados corresponden a la documentación del binario.
- No incluye modo thinking, visión ni audio.
- El binario se autodescribe como bot de copytrading con firma local de transacciones, filtros de seguridad de tokens y enrutado de órdenes; ninguna de estas capacidades está verificada de forma independiente.

## Casos de uso

No procede. Al no tratarse de un modelo de IA, no existen casos de uso legítimos de inferencia, generación o análisis que puedan recomendarse. Cualquier uso del binario implicaría ejecutar código de procedencia no verificada con acceso potencial a claves privadas de wallets, lo que supone un riesgo directo de pérdida de fondos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (consistencia del 97,9 % y 98,4 %, latencia inferior a 40 ms, uso de RAM inferior a 59 MB) son afirmaciones del autor sin metodología, sin conjunto de evaluación y sin verificación externa; no deben interpretarse como benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos del artefacto distribuido: Windows 10 u 11 de 64 bits; el autor declara un consumo de RAM inferior a 59 MB y un paquete de 8,9 MB. Estos datos no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable porque el repositorio no contiene un modelo de IA. Los elementos con los que podría compararse son otros binarios de trading automatizado, un ámbito en el que no hay referencias públicas fiables ni métricas estandarizadas.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal en contextos de investigación o desarrollo.
- Riesgo de seguridad elevado: distribución de un `.exe` a través de un repositorio de modelos, con contraseña de descompresión fija y ejecución recomendada como administrador. Este patrón es habitual en campañas de malware.
- Riesgo financiero: un bot de copytrading con acceso a claves privadas puede vaciar wallets. La afirmación de "almacén local AES-256 no custodial" no es verificable y no elimina el riesgo.
- Procedencia no verificable: el binario se aloja en un repositorio de GitHub de terceros (`tomasz5646/...`), no en el repositorio de Hugging Face; no hay firma de código ni compilación reproducible publicada.
- Sin actividad ni validación comunitaria: 0 descargas y 0 interacciones en el momento de la consulta.
- La licencia MIT se aplica al contenido del repositorio, pero no otorga ninguna garantía sobre el binario ni sobre su comportamiento en ejecución.
- Las etiquetas de idioma y las cifras de rendimiento de la model card son afirmaciones del autor sin respaldo; no deben usarse como datos técnicos.
- Recomendación: no descargar ni ejecutar el artefacto. Si se necesita un bot de trading, optar por software con código fuente auditable, compilación reproducible y gestión de claves mediante hardware wallet.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Redin/gmgn-bullx-photon-copytrade-bot-keyless
- Repositorio de GitHub referenciado en la model card (no verificado): https://github.com/tomasz5646/gmgn-bullx-photon-copytrade-bot-keyless
- No se han encontrado papers, blogs técnicos, demos ni documentación adicional en la información proporcionada.
