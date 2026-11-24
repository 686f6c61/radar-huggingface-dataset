# kanariu/trust-wallet-metamask-seed-recovery-v2

## Resumen

La ficha solicitada corresponde a `kanariu/trust-wallet-metamask-seed-recovery-v2`, un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial. El artefacto descrito en su model card es un ejecutable portable para Windows (`fisch-script-auto-catch-macro-2026-v1.2.2-win64.exe`, ~4,8 MB) distribuido en un ZIP protegido con contraseña, que se presenta como herramienta de "recuperación de seed" de monederos Trust Wallet y MetaMask. No se trata de un modelo de lenguaje, visión ni multimodal: no hay pesos neuronales, tokenizador, configuración de arquitectura ni pipeline de inferencia declarado.

El repositorio no declara parámetros, contexto, cuantizaciones ni formato de pesos, y su model card no describe ninguna arquitectura de red neuronal. El contenido técnico real del README es material promocional de un binario que afirma realizar parsing de keystores LevelDB, auditoría de tokens ERC20/SPL, resolución de mnemónicos parciales y rotación de RPC, con marcas de versión y "consistencia" sin metodología verificable.

Por todo ello, esta ficha documenta el artefacto tal como está publicado y advierte de que no es evaluable como modelo de IA. Cualquier uso en producción requeriría un análisis de seguridad independiente del binario, y el propósito declarado (extracción de frases semilla de terceros) es incompatible con un uso legítimo en la mayoría de jurisdicciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados como etiquetas; sin evaluación lingüística) |
| Licencia | MIT |
| Formato de pesos | no disponible (artefacto distribuido como ZIP con `fisch-script-auto-catch-macro-2026-v1.2.2-win64.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El repositorio no incluye ficheros de pesos (`safetensors`, `GGUF`, `ONNX` ni similares), ni `config.json`, ni tokenizador. El README describe un ejecutable con módulos que afirma implementar en C/C++ o similar: parser de LevelDB para keystores de extensiones de navegador, motor SIMD multinúcleo con hashing PBKDF2, resolución de mnemónicos parciales y rotación de endpoints RPC (Alchemy, Helius, QuickNode). No se aporta código fuente, hash de verificación, firma del binario ni reproducible build.

Las cifras que aparecen en la model card ("97,7 % de consistencia", "< 28 ms de respuesta", "< 28 MB de RAM", build `v2.3.3 (5B4D41)`) no van acompañadas de metodología, conjunto de prueba ni condiciones de medida, por lo que no son verificables. La contraseña del ZIP (`2026`) y el nombre del binario (`fisch-script-auto-catch-macro`) no guardan relación con el nombre del repositorio, lo que sugiere una plantilla reutilizada de otro proyecto.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües evaluadas; los idiomas listados son etiquetas de metadatos.
- No dispone de modo "thinking", visión, audio ni multimodalidad.
- El binario afirma, sin verificación independiente, realizar: parsing de keystores LevelDB, auditoría de saldos ERC20/SPL, reconstrucción de mnemónicos parciales y rotación de RPC.

## Casos de uso

- No se identifican casos de uso legítimos para un modelo de IA, porque no lo es.
- Auditoría de seguridad defensiva: un equipo podría analizar el binario en un entorno aislado para caracterizar su comportamiento, pero esto es análisis de malware, no uso del artefacto.
- Investigación de threat intelligence: estudiar el patrón de distribución (ZIP con contraseña, nombre de binario no relacionado, repositorio de Hugging Face como señuelo) como ejemplo de campaña de ingeniería social.
- Formación en concienciación: usar el repositorio como caso práctico de por qué no se deben ejecutar binarios de "recuperación de seed" de origen desconocido.
- No procede proponer escenarios de atención al cliente, generación de código, análisis documental ni similares: el artefacto no ofrece esas funciones.
- No procede proponer escenarios de recuperación de monederos propios: la forma correcta y segura es usar la frase semilla de respaldo con el cliente oficial del monedero, nunca herramientas de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras del README ("97,7 %", "96,1 %", "< 28 ms", "< 28 MB") carecen de metodología y no constituyen benchmarks reproducibles.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits, según el README.
- RAM: el README afirma "< 28 MB", cifra no verificada.
- GPU: no aplica; no hay inferencia neuronal.
- VRAM estimada: no aplica.
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no aplica, no hay pesos.
- Latencia y throughput: no disponibles de forma fiable.
- Recomendación: cualquier análisis del binario debe hacerse en una máquina virtual desechable sin acceso a red ni a monederos reales.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kanariu/trust-wallet-metamask-seed-recovery-v2` | Binario Windows x64 (no modelo IA) | no disponible | no disponible | MIT | Hugging Face, 0 descargas |
| Modelo de lenguaje open source (cualquiera, p. ej. familia Llama, Qwen, Mistral) | Modelo transformer con pesos | miles de millones | miles de tokens | variable | Hugging Face, ampliamente auditado |
| Cliente oficial de monedero (Trust Wallet, MetaMask) | Aplicación firmada | no aplica | no aplica | propietaria | tiendas oficiales |

No existe comparación técnica posible con modelos de IA: la categoría del artefacto es distinta.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal.
- Riesgo de seguridad grave: ejecutar un binario de origen desconocido que afirma manipular frases semilla expone al usuario a robo de fondos y de credenciales.
- El ZIP está protegido con contraseña, técnica habitual para evadir análisis automáticos de antivirus y sandboxes.
- El nombre del binario (`fisch-script-auto-catch-macro`) no coincide con el del repositorio, indicio de plantilla reutilizada o de suplantación.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en el mismo minuto: señal de publicación automatizada.
- La licencia MIT declarada no otorga legitimidad al propósito del binario; su uso puede infringir la legislación de ciberseguridad y protección de datos de la UE y de España.
- No se debe usar para "recuperar" monederos de terceros: la recuperación legítima se hace con la frase semilla propia y el cliente oficial.
- No hay hash, firma ni reproducible build que permita verificar la integridad del ejecutable.
- Los idiomas declarados no implican soporte real; son etiquetas de metadatos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kanariu/trust-wallet-metamask-seed-recovery-v2
- Documentación oficial de MetaMask: https://docs.metamask.io
- Documentación oficial de Trust Wallet: https://developer.trustwallet.com
- Buenas prácticas de seguridad de monederos (MetaMask): https://support.metamask.io
- Los enlaces de descarga incluidos en la model card (`github.com/YokoCastro3813/...`, `github.com/Hakansson210/...`) no se reproducen aquí por motivos de seguridad.
