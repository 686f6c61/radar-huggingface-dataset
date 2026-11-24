# Madi2004/gmgn-bullx-photon-copytrade-bot-v2

## Resumen

`Madi2004/gmgn-bullx-photon-copytrade-bot-v2` es un repositorio alojado en Hugging Face que, pese a su ubicación, no contiene un modelo de inteligencia artificial. La model card describe un supuesto ejecutable portable para Windows x64 (`gmgn-bullx-photon-copytrade-bot-v2-v1.2.0-win64.exe`, build `v4.5.5`) orientado a copiar operaciones de trading en plataformas de criptomonedas (GMGN, BullX, Photon), con módulos de paper trading, bundling de wallets, filtros anti-honeypot y gestión de claves AES-256. No se declara arquitectura neuronal, parámetros, tokenizador ni pipeline de inferencia.

El repositorio presenta cero descargas y cero likes en el momento de la consulta, y su contenido es un README promocional con enlaces a un binario alojado en GitHub, protegido por contraseña de descompresión (`2026`) e instrucciones para ejecutarlo como administrador. Esta combinación de características (binario cerrado, contraseña de archivo, petición de privilegios elevados, temática financiera y ausencia total de código o pesos auditables) es un patrón habitual en campañas de distribución de software potencialmente malicioso.

Por tanto, esta ficha no puede documentar especificaciones técnicas de un modelo porque no existe tal modelo. Se detalla a continuación lo que sí consta en la información disponible, junto con las advertencias de seguridad correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; no se declara arquitectura neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura, datos de entrenamiento, número de tokens, técnicas de alineación (RLHF, DPO) ni innovaciones de inferencia. El repositorio no contiene pesos, configuraciones de modelo, tokenizador ni código de entrenamiento. Lo que describe la model card es una aplicación de escritorio con módulos funcionales enumerados: sandbox de paper trading con 9 hilos de trabajo, motor de bundles Jito/MEV, almacén local de claves AES-256, bundler de 20 wallets mediante Lookup Tables, take profit multinivel y filtro anti-honeypot con tiempo de respuesta declarado inferior a 12 ms. Ninguna de estas afirmaciones es verificable a partir del contenido del repositorio, que no incluye código fuente.

La única información técnica objetiva es la del artefacto: un ZIP de 8,9 MB, con contraseña de extracción, que contiene un ejecutable para Windows x64. El tamaño es incompatible con cualquier modelo de lenguaje con pesos reales, lo que confirma que no se trata de un modelo.

## Capacidades

- No se declara ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se declara soporte de tool calling ni function calling en el sentido de modelos de lenguaje.
- No se declara soporte de agentes ni razonamiento multi-paso.
- El repositorio lista 14 idiomas en sus metadatos, pero no hay evidencia de capacidades multilingües de un modelo.
- Las funcionalidades descritas en la model card son de tipo financiero: copia de operaciones, paper trading, bundling de wallets, filtros anti-honeypot y gestión de claves.

## Casos de uso

No procede enumerar casos de uso de un modelo de IA, porque el repositorio no contiene ninguno. Los escenarios que describe la model card son:

- Automatización de copia de operaciones en plataformas de tokens: según el autor, replicaría operaciones de wallets de referencia; no verificable.
- Simulación de estrategias en sandbox: el autor declara ejecución de paper trading contra libros de órdenes en vivo; no verificable.
- Bundling multi-wallet en el mismo bloque: el autor describe ejecución con 20 wallets mediante Lookup Tables; no verificable.
- Gestión local de claves: el autor afirma firma no custodial con AES-256; no verificable.
- Filtrado previo a la compra: el autor declara verificación de autoridades de mint/freeze y bloqueo de liquidez; no verificable.
- Take profit automatizado: el autor describe objetivos escalonados y trailing stop; no verificable.

Ninguno de estos escenarios debe considerarse una recomendación de uso. Se listan únicamente como contenido declarado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras que aparecen en la model card son afirmaciones de marketing no auditables (por ejemplo, 490K descargas, 99 % de valoración verificada, 414 Hz de polling, menos de 33 MB de RAM), que no constituyen benchmarks de modelo y no pueden contrastarse con los metadatos del repositorio, donde las descargas y los likes figuran a cero.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no hay modelo que inferir.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.
- Requisito declarado del artefacto: Windows x64 (Windows 11 según etiquetas), ejecución como administrador y extracción previa de un ZIP protegido con contraseña.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no aloja un modelo de IA. Tampoco resulta equiparable a herramientas legítimas de trading, dado que no se distribuye código fuente ni documentación técnica verificable.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, arquitectura ni pipeline de inferencia. Cualquier evaluación como modelo es imposible.
- El artefacto distribuido es un ejecutable binario cerrado para Windows, sin código fuente, alojado fuera de Hugging Face y protegido con contraseña de descompresión. Este patrón impide la auditoría y es característico de distribución de malware.
- Las instrucciones piden ejecutar el binario como administrador, lo que otorga privilegios elevados a código no verificado.
- La temática financiera (claves privadas, wallets, operaciones con criptoactivos) incrementa el riesgo de robo de fondos si el binario exfiltra claves o semillas.
- Las métricas de popularidad de la model card (490K descargas, 99 % verificado) contradicen los metadatos del repositorio (0 descargas, 0 likes), lo que sugiere manipulación del contenido promocional.
- La licencia MIT declarada no aporta garantías sobre el binario ni sobre su cadena de suministro.
- No se debe descargar ni ejecutar el artefacto. Si se ha ejecutado, se recomienda analizarlo en un entorno aislado y revisar la integridad de las wallets y credenciales expuestas.
- No se identifican sesgos de modelo porque no hay modelo; el riesgo relevante es de seguridad, no de calidad de salida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Madi2004/gmgn-bullx-photon-copytrade-bot-v2
- Enlace al binario citado en la model card (no recomendado): https://github.com/RuyetuPe45/gmgn-bullx-photon-copytrade-bot-v2/releases/latest/download/gmgn-bullx-photon-copytrade-bot-v2-v1.2.0-win64.zip
- Página de releases citada en la model card: https://github.com/RuyetuPe45/gmgn-bullx-photon-copytrade-bot-v2/releases/latest
- Paper, blog o demo: no disponible
