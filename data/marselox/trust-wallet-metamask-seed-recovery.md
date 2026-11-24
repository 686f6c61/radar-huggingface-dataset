# Marselox/trust-wallet-metamask-seed-recovery

## Resumen

`Marselox/trust-wallet-metamask-seed-recovery` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial, sino un supuesto ejecutable portable para Windows de 64 bits distribuido como archivo ZIP de 8,9 MB. La model card lo presenta como una herramienta de "recuperación de semillas" (seed recovery) para carteras Trust Wallet y MetaMask, con funciones declaradas de validación BIP39, derivación multi-cadena (EVM, Solana, BTC) y resolución parcial de mnemónicos. No se declara arquitectura de red neuronal, parámetros, contexto ni pipeline de inferencia.

El artefacto se distribuye mediante un enlace externo a un repositorio de GitHub (`Yamada36428/trust-wallet-metamask-seed-recovery`), protegido con contraseña de descompresión. La model card incluye instrucciones para ejecutar el binario como administrador, lo que constituye un patrón habitual en campañas de distribución de software malicioso. Bajo ninguna interpretación razonable este repositorio debe tratarse como un modelo open source evaluable.

Desde la perspectiva de un catálogo técnico de IA, la ficha se limita a documentar la existencia del artefacto, sus metadatos declarados y las advertencias de seguridad pertinentes. No hay información verificable sobre arquitectura, entrenamiento, capacidades cognitivas ni benchmarks, por lo que la mayoría de secciones indican "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo, no verificable) |
| Licencia | MIT (declarada) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` de Windows) |
| Tamano del paquete | 8,9 MB (ZIP declarado) |
| Version / build | v3.4.9 (920AAA) según la model card |
| Plataforma objetivo | Windows 10/11 de 64 bits |
| Descargas | 0 (en el momento de la consulta) |
| Likes | 0 |

## Arquitectura y entrenamiento

No disponible. El repositorio no describe ninguna arquitectura de red neuronal, dataset de entrenamiento, proceso de preentrenamiento, ajuste fino, RLHF ni DPO. La model card únicamente enumera módulos funcionales de una supuesta herramienta de escritorio: validador BIP39 local, motor SIMD multinúcleo con PBKDF2, derivación BIP44/BIP84, rotación de RPC y resolución parcial de mnemónicos.

No existe evidencia de que el binario realice las funciones declaradas. La combinación de un ejecutable de procedencia no verificable, distribución vía enlace externo, contraseña fija de descompresión y solicitud de ejecución como administrador es un patrón documentado en campañas de malware dirigidas a usuarios de criptomonedas.

## Capacidades

- No se ha documentado ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No hay soporte declarado de tool calling ni function calling en el sentido de modelos de lenguaje.
- No hay capacidades de agente ni razonamiento multi-paso.
- Las funciones que la model card atribuye al binario (validación BIP39, derivación de direcciones, rotación de RPC) no son capacidades de un modelo de IA y no han sido verificadas de forma independiente.
- El multilingüismo listado en los metadatos corresponde a etiquetas del repositorio, no a capacidades del artefacto.

## Casos de uso

- No se identifican casos de uso legítimos para un modelo de IA, ya que el repositorio no contiene ninguno.
- El supuesto caso de uso declarado (recuperación de semillas de carteras) implica el manejo de material criptográfico sensible y no debe ejecutarse desde fuentes no auditadas.
- Un desarrollador que busque un modelo open source para tareas de NLP, código o razonamiento no encontrará aquí ningún artefacto utilizable.
- Un investigador que evalúe riesgos de cadena de suministro puede usar este repositorio como ejemplo de publicación abusiva en Hugging Face.
- Un equipo de seguridad puede emplearlo como muestra para formación en detección de ingeniería social dirigida a usuarios de cripto.
- No se recomienda su descarga, descompresión ni ejecución en ningún entorno, ni aislado, sin análisis previo en sandbox.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras de rendimiento del supuesto binario (tiempos de respuesta en milisegundos, frecuencia de polling en Hz, consistencia del 97,5 %), pero no son verificables ni comparables con benchmarks de modelos de IA.

## Requisitos de hardware

- No aplica: no hay modelo de IA que cargar en VRAM.
- El artefacto declarado es un ejecutable Windows x64 de 8,9 MB que, según la model card, no requiere dependencias externas.
- No se especifican requisitos de GPU, CPU ni memoria.
- No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni ningún runtime de inferencia.
- No se dispone de datos de latencia ni throughput verificables.

## Comparativa con modelos similares

No disponible. No existe categoría de modelo comparable, ya que el repositorio no contiene un modelo de lenguaje ni un artefacto de IA. Cualquier comparación con modelos de la misma familia (por ejemplo, modelos de 7B a 70B para NLP) carece de sentido técnico.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; los metadatos de Hugging Face (tags de idiomas, licencia MIT) no reflejan un artefacto de aprendizaje automático.
- Distribución mediante enlace externo a GitHub con contraseña fija de descompresión (`2026`) y solicitud de ejecución como administrador: patrón de riesgo elevado.
- El nombre del repositorio sugiere la recuperación de frases semilla de carteras cripto, un vector clásico de robo de fondos.
- No hay verificación independiente de las funciones declaradas ni del binario.
- La licencia MIT declarada no otorga garantías sobre el contenido ni lo legitima.
- Riesgo de suplantación de marca: no hay relación verificable con Trust Wallet ni con MetaMask.
- No debe ejecutarse en equipos con carteras activas, claves privadas o material criptográfico.
- Cualquier análisis debe realizarse en una máquina virtual aislada y sin red, con herramientas de análisis dinámico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Marselox/trust-wallet-metamask-seed-recovery
- Repositorio de GitHub referenciado en la model card: https://github.com/Yamada36428/trust-wallet-metamask-seed-recovery
- Enlace de descarga directa citado en la model card: https://github.com/Yamada36428/trust-wallet-metamask-seed-recovery/releases/latest/download/trust-wallet-metamask-seed-recovery-v1.2.0-win64.zip
- No se han encontrado papers, blogs, demos ni documentación técnica adicional en la información disponible.
