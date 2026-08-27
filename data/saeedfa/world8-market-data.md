# Saeedfa/world8-market-data

## Resumen

World 8 Market Data es un repositorio de datos de mercado publicado en HuggingFace por el usuario Saeedfa, concebido como una capa compartida de datos orientada a la evidencia para sistemas de pronóstico y evaluación. No se trata de un modelo de inteligencia artificial, sino de un componente de infraestructura de datos que define políticas de almacenamiento, normalización, caché y acceso para observaciones de mercado. El proyecto se encuentra en fase de pre-lanzamiento de desarrollo (v0.1.0) y no está destinado a producción.

La relevancia de este repositorio radica en su enfoque en la trazabilidad de la evidencia: almacena "recibos de evidencia" en lugar de historiales masivos de mercado, y delega en un nodo compartido de datos de mercado la gestión de caché, normalización, relleno de huecos y control de políticas. Su arquitectura está pensada para integrarse con componentes de pronóstico y evaluación, aunque el propio autor declara explícitamente que no se garantiza un servicio completo de datos de mercado ni fiabilidad de nivel de exchange en esta versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una capa de datos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de datos, no contiene pesos) |

## Arquitectura y entrenamiento

No aplica en el sentido de un modelo de IA. El repositorio describe una arquitectura de datos con los siguientes componentes: una "Spine" que almacena recibos de evidencia en lugar de historiales completos de mercado; una "Derived Store" que contiene características, pronósticos, salidas de evaluación y conocimiento derivado; una política de caché para datos OHLCV a partir de 1 hora; límites para historiales de minutos/ticks; y un "Market Data Node" compartido que gestiona caché, normalización, relleno de huecos y el comportamiento de "Policy Gate". No se proporcionan datos de entrenamiento porque no existe un proceso de entrenamiento.

## Capacidades

- Almacenamiento de recibos de evidencia en lugar de historiales masivos de mercado.
- Caché de datos OHLCV a resolución de 1 hora o superior, con política de retención configurable.
- Historial de minutos/ticks acotado por política.
- Libros de órdenes bajo demanda, salvo retención explícita.
- Normalización y relleno de huecos en datos de mercado.
- Control de acceso mediante "Policy Gate" para observaciones de mercado.
- Integración prevista con componentes de pronóstico y evaluación.

## Casos de uso

- Infraestructura de datos para sistemas de pronóstico financiero: el repositorio puede servir como capa de datos compartida para alimentar modelos de predicción, garantizando que las observaciones se almacenen como evidencia trazable.
- Evaluación de estrategias de trading: al mantener recibos de evidencia y datos derivados, permite auditar qué datos se usaron para generar una señal o evaluación concreta.
- Caché de datos OHLCV para análisis histórico: la política de retención permite almacenar datos de velas a partir de 1 hora, útil para backtesting sin necesidad de almacenar ticks completos.
- Normalización de fuentes de mercado heterogéneas: el nodo de datos de mercado unifica formatos y rellena huecos, facilitando la integración de múltiples proveedores.
- Control de acceso a datos sensibles: el "Policy Gate" permite restringir el acceso a observaciones de mercado según políticas definidas, útil en entornos regulados.
- Trazabilidad de decisiones en sistemas de IA financiera: al vincular cada pronóstico con sus datos de entrada, se puede auditar el razonamiento de modelos downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene métricas de rendimiento ni comparaciones con otros sistemas.

## Requisitos de hardware

No aplica. Al ser un repositorio de datos y no un modelo de IA, no requiere VRAM, GPU ni hardware de inferencia. El despliegue dependerá de la infraestructura de datos que lo consuma (bases de datos, servicios de caché, etc.).

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable, ya que World 8 Market Data no es un modelo de IA sino una capa de datos. No se pueden comparar parámetros, contexto ni rendimiento con alternativas.

## Limitaciones y advertencias

- Estado de desarrollo pre-lanzamiento: el autor declara que v0.1.0 es una versión de desarrollo y no está destinada a producción.
- Sin garantía de fiabilidad: no se reclama un servicio completo de datos de mercado ni fiabilidad de nivel de exchange.
- Sin licencia especificada: no se indica la licencia del repositorio, lo que limita su uso comercial sin consulta previa.
- Sin datos de rendimiento: no hay benchmarks ni métricas de calidad de datos.
- Alcance limitado: la política de almacenamiento restringe el historial de minutos/ticks y los libros de órdenes, lo que puede ser insuficiente para aplicaciones que requieran datos de alta frecuencia.
- Dependencia de fuentes externas: la normalización y el relleno de huecos dependen de la calidad de los datos de origen, que no se especifican.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Saeedfa/world8-market-data
- Repositorio canónico en GitHub: https://github.com/saeedfaai/world-8
- Pre-lanzamiento de desarrollo v0.1.0: https://github.com/saeedfaai/world-8/releases/tag/V0.1.0
- Registro en Zenodo: https://zenodo.org/records/22127650
- DOI: https://doi.org/10.5281/zenodo.22127650
- DOI histórico Z0-A: https://doi.org/10.5281/zenodo.22085394
