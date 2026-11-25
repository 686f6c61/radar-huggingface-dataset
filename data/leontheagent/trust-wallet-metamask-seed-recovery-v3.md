# leontheagent/trust-wallet-metamask-seed-recovery-v3

## Resumen

El repositorio `leontheagent/trust-wallet-metamask-seed-recovery-v3`, publicado en Hugging Face por el usuario `leontheagent`, no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows 10 y Windows 11 (x64) distribuido como archivo ZIP, presuntamente orientado a la recuperación de frases semilla de monederos Trust Wallet y MetaMask. La model card describe módulos de derivación multi-cadena, rotación de nodos RPC, auditoría de tokens ERC20/SPL y parseo de keystores LevelDB, junto con instrucciones para descargar un binario alojado en un repositorio de GitHub de terceros.

No se declara arquitectura de red neuronal, número de parámetros, longitud de contexto, proceso de entrenamiento ni formato de pesos. Los metadatos de Hugging Face únicamente indican licencia MIT, una lista de 14 idiomas y etiquetas relativas a Windows y al propio nombre del paquete. El pipeline figura como no disponible.

La relevancia de esta ficha es fundamentalmente de advertencia: el contenido presenta los patrones típicos de una campaña de distribución de software malicioso (nombre que suplanta funcionalidad legítima de recuperación de semillas, binario alojado fuera de Hugging Face, contraseña fija para el archivo comprimido, ejecución como administrador y marcas de descargas y valoraciones no verificables). No debe tratarse como un modelo evaluable ni ejecutarse en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; paquete ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id |
| Licencia | MIT |
| Formato de pesos | no disponible (distribucion como ZIP con ejecutable `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El artefacto descrito en la model card es un ejecutable Windows de 64 bits (`elden-ring-nightreign-trainer-coop-2026-v1.2.2-win64.exe`, build `v3.4.5` / `FD268432BF`) empaquetado en un ZIP de 4,8 MB protegido con la contraseña `2026`. La documentación menciona componentes como rotación de RPC con conmutación entre Alchemy, Helius y QuickNode, derivación de direcciones BIP44/BIP84 para EVM, Solana y BTC, y un motor multihilo con PBKDF2 y SIMD, pero no aporta especificaciones verificables, código fuente ni artefactos de entrenamiento.

No hay información sobre dataset, número de tokens, RLHF, DPO ni innovaciones de inferencia. Cualquier afirmación de rendimiento en la model card (por ejemplo, tiempos de respuesta inferiores a 37 ms o uso de RAM inferior a 55 MB) procede del propio autor y no es contrastable con la información disponible.

## Capacidades

- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- La model card atribuye al binario funciones de derivación de direcciones multi-cadena, auditoría de saldos de tokens y exportación de informes, sin evidencia técnica independiente.
- No se especifica ninguna capacidad de modelo lingüístico pese a la lista de 14 idiomas en los metadatos.

## Casos de uso

- No procede: el artefacto no es un modelo de IA y no admite casos de uso de inferencia.
- Evaluación de seguridad: el repositorio puede emplearse como muestra para analizar patrones de suplantación de marcas (Trust Wallet, MetaMask) en plataformas de modelos.
- Formación en concienciación: sirve como ejemplo didáctico de ingeniería social basada en la promesa de recuperación de semillas.
- Análisis de cadena de suministro: permite estudiar la práctica de alojar binarios en repositorios de GitHub ajenos al autor declarado.
- Investigación de malware: el ZIP y el ejecutable podrían someterse a análisis estático en un entorno aislado.
- Documentación de taxonomías de abuso: útil para equipos de moderación que cataloguen contenido engañoso en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 10 y Windows 11 de 64 bits.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no son relevantes).
- Latencia y throughput: las cifras de la model card (menos de 37 ms, menos de 55 MB de RAM, 14 hilos) no son verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Naturaleza |
|---|---|---|---|---|---|
| trust-wallet-metamask-seed-recovery-v3 | no disponible | no disponible | MIT | Hugging Face (0 descargas, 0 likes) | Paquete ejecutable Windows |
| Modelos de IA open source comparables | no disponible | no disponible | no disponible | no disponible | No existe categoría equivalente |

No se identifican modelos de IA comparables porque el artefacto no pertenece a esa categoría.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; la ficha de Hugging Face se usa como canal de distribución de un ejecutable.
- El binario se aloja en un repositorio de GitHub de un tercero (`claudio00344`, `Truong81752`) distinto del autor declarado en Hugging Face.
- La contraseña fija del ZIP (`2026`) y la instrucción de ejecutar como administrador son indicadores de riesgo habituales en campañas de malware.
- Las insignias de valoración (4,9/5) y descargas (427K+) de la model card no están respaldadas por los metadatos de Hugging Face, que registran 0 descargas y 0 likes.
- El nombre suplanta funcionalidades de recuperación de semilla de monederos cripto, un vector clásico de robo de fondos.
- La licencia MIT declarada no otorga garantías sobre el contenido del binario ni sobre su comportamiento en ejecución.
- Riesgo elevado de exfiltración de frases semilla, claves privadas y keystores si se ejecuta en un sistema con monederos instalados.
- No debe desplegarse en producción ni en máquinas con acceso a material criptográfico sensible.
- Los sesgos y la alucinación no son aplicables al no existir modelo lingüístico; el riesgo relevante es de seguridad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/leontheagent/trust-wallet-metamask-seed-recovery-v3
- Repositorio de GitHub referenciado en la model card: https://github.com/Truong81752/trust-wallet-metamask-seed-recovery-v3
- Repositorio de GitHub del binario: https://github.com/claudio00344/elden-ring-nightreign-trainer-coop-2026
- Paper: no disponible
- Blog o demo: no disponible
