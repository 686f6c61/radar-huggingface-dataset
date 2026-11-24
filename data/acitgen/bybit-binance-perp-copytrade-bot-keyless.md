# Acitgen/bybit-binance-perp-copytrade-bot-keyless

## Resumen

El identificador `Acitgen/bybit-binance-perp-copytrade-bot-keyless` corresponde a un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Pese a la denominación del autor y a las etiquetas asociadas (`windows`, `windows-11`, `x64`, `portable`), el contenido de la model card describe un supuesto ejecutable para Windows orientado a la copia de operaciones (copytrade) en futuros perpetuos de Bybit y Binance, empaquetado en un archivo ZIP de 4,8 MB. No existe información sobre arquitectura, pesos, tokenizador ni proceso de entrenamiento.

La ficha se redacta, por tanto, como una evaluación técnica del artefacto publicado, no de un modelo lingüístico. Desde el punto de vista de un investigador o desarrollador, el repositorio carece de cualquier elemento verificable propio de un modelo open source: no hay archivos de pesos (safetensors, GGUF ni otros), no hay configuración de transformer, no hay pipeline declarado y no se han publicado resultados de evaluación. El pipeline figura como "no disponible" y las descargas e interacciones registradas son cero en el momento de la consulta.

La relevancia de esta entrada es fundamentalmente negativa: constituye un ejemplo de publicación en Hugging Face que suplanta la categoría de modelo mediante etiquetas y texto promocional, e incluye enlaces a binarios alojados en GitHub con nombres de archivo ajenos al proyecto (referencias a un supuesto *trainer* de un videojuego) y una contraseña de descompresión. Se recomienda tratar el artefacto como no fiable y no ejecutarlo en entornos de producción ni en máquinas con credenciales de exchange.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; no verificable en un modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto referenciado es un ZIP de 4,8 MB con un `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card no incluye información sobre tokens de entrenamiento, composición del dataset, técnicas de alineación (RLHF, DPO) ni innovaciones de inferencia. El texto describe funcionalidades de un supuesto bot de trading: motor de bundles Jito/MEV, take profit multinivel, sandbox de paper trading, enrutamiento de órdenes con latencia declarada inferior a 40 ms, copia de wallets "smart money" y un bundler de 20 wallets mediante Lookup Tables. Ninguna de estas afirmaciones viene acompañada de código fuente, binarios verificables ni métricas reproducibles.

El contenido técnico es internamente incoherente: mezcla terminología de trading de criptoactivos (Jito, MEV, LUT, order routing) con nombres de archivo de un *trainer* de videojuego (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip`), un patrón habitual en campañas de distribución de software no deseado. La contraseña de descompresión (`2026`) y la instrucción de ejecutar como administrador incrementan el riesgo de seguridad.

## Capacidades

- No se ha documentado ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No hay soporte declarado de tool calling ni function calling en el sentido de un modelo lingüístico.
- No hay evidencia de razonamiento multi-paso ni de modo de pensamiento (*thinking mode*).
- Las capacidades multilingües figuran solo como etiquetas de metadatos, sin modelo subyacente que las sustente.
- El artefacto declara funcionalidades de automatización de trading (copytrade, gestión de órdenes, paper trading) sin código ni binarios auditables.

## Casos de uso

- **Auditoría de publicaciones sospechosas en Hugging Face:** usar este repositorio como caso de estudio para formar a equipos de seguridad sobre etiquetado engañoso, suplantación de categoría de modelo y enlaces a binarios externos.
- **Análisis de campañas de distribución de software no deseado:** examinar la estructura de la model card (badges falsos de descargas y valoración, contraseña de ZIP, nombres de archivo incongruentes) como patrón detectable en pipelines de moderación automatizada.
- **Pruebas de filtros de moderación de plataformas:** incorporar el repositorio a conjuntos de validación para clasificadores que distingan modelos reales de artefactos no relacionados.
- **Formación en higiene de cadena de suministro:** ilustrar por qué no deben ejecutarse binarios descargados desde repositorios sin trazabilidad ni firma, especialmente con permisos de administrador y credenciales de exchange en el mismo equipo.
- **Investigación de fraude financiero:** documentar tácticas de captación basadas en promesas de copytrade y MEV para informes de threat intelligence.
- **Verificación de licencias:** comprobar cómo una licencia MIT declarada en metadatos puede aplicarse a un artefacto que no es un modelo, lo que complica la interpretación jurídica del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (latencia inferior a 32-40 ms, sondeo a 186 Hz, tamaño de 4,8 MB) son afirmaciones promocionales sin metodología, sin entorno de medición y sin posibilidad de reproducción; no deben interpretarse como benchmarks de un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras declaradas en la model card carecen de respaldo.
- Requisito declarado del artefacto: Windows 10 u 11 de 64 bits, con ejecución como administrador según las instrucciones de la model card.

## Comparativa con modelos similares

No disponible. No existe categoría de modelo comparable porque el repositorio no publica un modelo de IA. Frente a publicaciones legítimas de la misma plataforma, las diferencias son estructurales:

| Criterio | Este repositorio | Modelo open source típico en Hugging Face |
|---|---|---|
| Pesos publicados | No | Sí (safetensors, GGUF) |
| Configuración de arquitectura | No | `config.json` con hiperparámetros |
| Pipeline declarado | No disponible | `text-generation`, `image-text-to-text`, etc. |
| Resultados de evaluación | No | Model card con benchmarks |
| Artefacto distribuido | ZIP con `.exe` y contraseña | Pesos y tokenizador |
| Trazabilidad | Baja (enlaces a repos de GitHub de terceros) | Reproducible |

## Limitaciones y advertencias

- **No es un modelo de IA:** no debe evaluarse como tal ni incorporarse a comparativas de modelos.
- **Riesgo de seguridad elevado:** la model card indica descargar un ZIP protegido con contraseña y ejecutar un `.exe` como administrador; este patrón es habitual en la distribución de malware y stealers de credenciales.
- **Suplantación de identidad de proyecto:** los nombres de archivo remiten a un *trainer* de un videojuego, lo que sugiere reutilización de infraestructura ajena.
- **Métricas no verificables:** los badges de 312K descargas y valoración 5.0/5 no coinciden con las cero descargas y cero likes registrados en la plataforma.
- **Riesgo financiero directo:** cualquier software que solicite claves de API de exchanges para copytrade puede vaciar cuentas; no hay auditoría ni código publicado.
- **Licencia MIT engañosa en contexto:** la licencia no otorga garantías sobre el binario ni sobre su comportamiento en ejecución.
- **Sesgos y alucinación:** no aplica en el sentido de un modelo lingüístico; sí aplica la ausencia total de veracidad verificable en las afirmaciones de la model card.
- **Uso comercial:** desaconsejado en cualquier escenario; no hay soporte, mantenimiento ni responsabilidad del autor.
- **Idiomas:** las etiquetas multilingües no implican capacidad real, al no existir modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Acitgen/bybit-binance-perp-copytrade-bot-keyless
- Enlace a binario citado en la model card (GitHub, no verificado): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Releases citadas en la model card (GitHub, no verificado): https://github.com/gAguilar94827/bybit-binance-perp-copytrade-bot-keyless/releases/latest
- Paper, blog o demo oficial: no disponible
